import { Component, Inject, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { UploadServices } from '../../services/upload-services';
@Component({
  selector: 'app-upload',
  imports: [MatButtonModule, MatIconModule, MatDialogModule, MatExpansionModule],

  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class Upload {

  private readonly dialog = inject(MatDialog);
  private uploadServices = inject(UploadServices);
  private dialogRef = inject(MatDialogRef<Upload>)
  private readonly data = inject(MAT_DIALOG_DATA);

  veicolo: any = signal<any>(null);
  imageUrl = signal(null);
  msg = signal("");

  fileName: string = '';
  selectedFile: File | null = null;

  constructor() {
    if (this.data) {
      this.veicolo.set(this.data.veicolo);
    }
  }
  ngOnInit(): void {
   //console.log("marca:" + this.veicolo().marca)
    if (this.veicolo().image != null)
      this.imageUrl.set(this.veicolo().image);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.fileName = '';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = input.files[0]; // recupera il file selezionato
    this.fileName = this.selectedFile.name;

    console.log('File selezionato:', this.selectedFile);

    this.onUpload();

  }

  onUpload() {
    console.log("*** upload *****:");
    this.uploadServices.upload(this.selectedFile, this.veicolo().id)
      .subscribe({
        next: ((r: any) => {
          this.uploadServices.getUrl(r.msg)   // upload image and save in veicolo
            .subscribe(({
              next: ((r: any) => {
                this.imageUrl.set(r.msg);    // load url
              })
            }))
        }),
        error: ((r: any) => {
          console.log(r.error.msg);
          this.msg.set(r.error.msg);
        })
      })
  }
}