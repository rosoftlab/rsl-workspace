import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveDictionary } from 'projects/rosoftlab/rdict/src/lib/reactive-dictionary';
import { FileService } from '../../services/file.service';
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  imports: [CommonModule]
})
export class TestComponent implements OnInit {
  selectedFile: File | null = null;
  ai_response: any | null = null;
  constructor(private rdict: ReactiveDictionary, private fileService: FileService) {}

  ngOnInit() {}
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
      this.fileService.uploadFile(this.selectedFile).subscribe(
        (response) => {
          if (response.type === 'response') {
            console.log('File uploaded successfully:', response);
            // records['file_id'] = response.fileId;
            // await dataP.update(response, null);
            //I have the excel updated so now i can create a new processed data
            this.rdict.get$('ai').subscribe((aiInstanceData) => {
              aiInstanceData.executeFunction('get_column_maming', [response.fileId, 'Foaie1'], {}, 300_000).subscribe((processResponse) => {
                console.log('File processed successfully:', processResponse);
                this.ai_response = processResponse;
              });
            });
          } else if (response.type === 'progress') {
            console.log('Upload progress:', response.loaded, '/', response.total);
          }
        },
        (error) => {
          console.error('Error uploading file:', error);
        }
      );
    }
  }
}
