import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { hasAllowedExtension, hasAllowedMime, isUnderMaxSize } from '../../../shared/utils/file-validators';
import { MAX_FILE_SIZE_BYTES } from '../../../shared/constants/file.constants';
import { CsvPreview, csvPreviewFromFile } from '../../../shared/utils/csv-preview';
import { UploadCsvService } from '../../../core/service/upload-csv.service';
import { NormalizedError } from '../../../core/interfaces/api-error.interfaces';
import { downloadErroresCsv, normalizeApiError } from '../../../shared/utils/error-normalizer';
import { ApiResult, ProcessResponseDto } from '../../../core/interfaces/api.interfaces';

type PageItem = { type: 'page'; value: number } | { type: 'dots' };

@Component({
  selector: 'app-drop-file',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drop-file.html',
  styleUrls: ['./drop-file.css']  // 👈 plural
})
export class DropFile {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  private api = inject(UploadCsvService);

  file = signal<File | null>(null);
  preview = signal<CsvPreview | null>(null);
  dragging = signal(false);
  errorMsg = signal<string | null>(null);
  infoMsg = signal<string | null>(null);
  loading = signal(false);
  errorObj = signal<NormalizedError | null>(null);
  showDetail = signal<boolean>(false);

  page = signal(1);
  pageSize = signal(10);

  totalRows = computed(() => this.preview()?.rows.length ?? 0);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalRows() / this.pageSize())));

  pagedRows = computed(() => {
    const rows = this.preview()?.rows ?? [];
    const start = (this.page() - 1) * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  rangeText = computed(() => {
    const total = this.totalRows();
    if (!total) return 'Resultado 0';
    const start = (this.page() - 1) * this.pageSize() + 1;
    const end = Math.min(total, start + this.pageSize() - 1);
    return `Resultado ${start} - ${end} de ${total}`;
  });

  paginationItems = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    const items: PageItem[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) items.push({ type: 'page', value: i });
      return items;
    }
    items.push({ type: 'page', value: 1 });
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    if (left > 2) items.push({ type: 'dots' });
    for (let i = left; i <= right; i++) items.push({ type: 'page', value: i });
    if (right < total - 1) items.push({ type: 'dots' });
    items.push({ type: 'page', value: total });
    return items;
  });

  goto(p: number) { this.page.set(Math.min(this.totalPages(), Math.max(1, p))); }
  prev() { this.goto(this.page() - 1); }
  next() { this.goto(this.page() + 1); }

  readonly canUpload = computed(() => !!this.file() && !this.errorMsg());

  onBrowseChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.handleFile(f);
    input.value = '';
  }

  onDrop(ev: DragEvent) {
    ev.preventDefault();
    this.dragging.set(false);
    const f = ev.dataTransfer?.files?.[0] ?? null;
    this.handleFile(f);
  }

  onDragOver(ev: DragEvent) {
    ev.preventDefault();
    if (!this.dragging()) this.dragging.set(true);
  }

  onDragLeave() {
    this.dragging.set(false);
  }

  private async handleFile(f: File | null) {
    this.resetMsgs();
    this.preview.set(null);
    this.file.set(null);
    this.page.set(1);

    if (!f) return;

    if (!hasAllowedExtension(f) || !hasAllowedMime(f)) {
      this.errorMsg.set('Formato inválido. Solo se permite un archivo .csv.');
      return;
    }
    if (!isUnderMaxSize(f)) {
      this.errorMsg.set(`El archivo supera el tamaño máximo permitido (${Math.floor(MAX_FILE_SIZE_BYTES/1000)} KB).`);
      return;
    }

    this.file.set(f);
    try {
      const p = await csvPreviewFromFile(f);
      this.preview.set(p);
      this.infoMsg.set(`Archivo listo: ${f.name} (${Math.round(f.size/1024)} KB)`);
      this.page.set(1);
    } catch {
      this.errorMsg.set('No fue posible leer el archivo. Verifica que el CSV sea válido.');
    }
  }

  unwrapMsg(m: unknown): string | undefined {
    if (!m) return;
    if (typeof m === 'string') return m;
    if (typeof m === 'object' && 'message' in (m as any)) {
      const mm = (m as any).message;
      return typeof mm === 'string' ? mm : undefined;
    }
    return;
  }

  async upload() {
    if (!this.file() || this.errorMsg()) return;
    this.loading.set(true);
    this.infoMsg.set(null);
    this.errorMsg.set(null);
    this.errorObj.set(null);
    this.showDetail.set(false);
  
    try {
      const res = (await firstValueFrom(this.api.uploadCsv(this.file()!))) as ApiResult<ProcessResponseDto>;
      const ok = (res as any).ok ?? (res as any).success ?? false;
      const userMsg =
        this.unwrapMsg(res.message) ||
        this.unwrapMsg((res as any)?.data?.message) ||
        (ok ? 'Archivo procesado correctamente.' : 'No se pudo procesar el archivo.');
      if (ok) this.infoMsg.set(userMsg); else this.errorMsg.set(userMsg);
    } catch (err: any) {
      const n = normalizeApiError(err);
      this.errorObj.set(n);
      this.errorMsg.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  copyCorrelationId() {
    const cid = this.errorObj()?.correlationId;
    if (cid) navigator.clipboard?.writeText(cid);
  }
  
  exportErrorsCsv() {
    const d = this.errorObj()?.detalle ?? [];
    if (d.length) downloadErroresCsv(d);
  }

  clear() {
    this.fileInput?.nativeElement && (this.fileInput.nativeElement.value = '');

    this.file.set(null);
    this.preview.set(null);
    this.page.set(1);
    this.errorObj.set(null);
    this.showDetail.set(false);
    this.dragging.set(false);
    this.resetMsgs();
  }

  private resetMsgs() {
    this.errorMsg.set(null);
    this.infoMsg.set(null);
  }
}
