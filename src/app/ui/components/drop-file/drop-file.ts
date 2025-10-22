import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { hasAllowedExtension, hasAllowedMime, isUnderMaxSize } from '../../../shared/utils/file-validators';
import { MAX_FILE_SIZE_BYTES } from '../../../shared/constants/file.constants';
import { CsvPreview, csvPreviewFromFile } from '../../../shared/utils/csv-preview';
import { UploadCsvService } from '../../../core/service/upload-csv.service';

@Component({
  selector: 'app-drop-file',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drop-file.html',
  styleUrls: ['./drop-file.css']  // 👈 plural
})
export class DropFile {
  private api = inject(UploadCsvService);

  file = signal<File | null>(null);
  preview = signal<CsvPreview | null>(null);
  dragging = signal(false);
  errorMsg = signal<string | null>(null);
  infoMsg = signal<string | null>(null);
  loading = signal(false);

  readonly canUpload = computed(() => !!this.file() && !this.errorMsg());

  onBrowseChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    this.handleFile(f);
    input.value = ''; // permite re-seleccionar mismo archivo
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

    if (!f) return;

    // Validaciones
    if (!hasAllowedExtension(f) || !hasAllowedMime(f)) {
      this.errorMsg.set('Formato inválido. Solo se permite un archivo .csv.');
      return;
    }
    if (!isUnderMaxSize(f)) {
      this.errorMsg.set(`El archivo supera el tamaño máximo permitido (${Math.floor(MAX_FILE_SIZE_BYTES/1000)} KB).`);
      return;
    }

    // Si pasa validaciones, guarda y genera preview
    this.file.set(f);
    try {
      const p = await csvPreviewFromFile(f, 30);
      this.preview.set(p);
      this.infoMsg.set(`Archivo listo: ${f.name} (${Math.round(f.size/1024)} KB)`);
    } catch {
      this.errorMsg.set('No fue posible leer el archivo. Verifica que el CSV sea válido.');
    }
  }

  async upload() {
    if (!this.file() || this.errorMsg()) return;
    this.loading.set(true);
    this.infoMsg.set(null);

    try {
      // El servicio devuelve ApiResult<ProcessResponseDto>. En 400 también llega como body tipado (ok=false).
      const res = await firstValueFrom(this.api.uploadCsv(this.file()!));

      if (res.ok) {
        const d = res.data!;
        this.infoMsg.set(`Procesados ${d.procesados}/${d.total}. Rechazados: ${d.rechazados}.`);
      } else {
        const e = res.errors?.[0];
        const cid = res.correlationId ? ` — ID: ${res.correlationId}` : '';
        this.errorMsg.set(`${e?.message ?? 'No se pudo procesar el archivo.'}${cid}`);
      }
    } catch {
      // Solo entra aquí por errores de red o caídas no controladas
      this.errorMsg.set('Error de red. Intenta nuevamente en unos minutos.');
    } finally {
      this.loading.set(false);
    }
  }

  clear() {
    this.file.set(null);
    this.preview.set(null);
    this.resetMsgs();
  }

  private resetMsgs() {
    this.errorMsg.set(null);
    this.infoMsg.set(null);
  }
}
