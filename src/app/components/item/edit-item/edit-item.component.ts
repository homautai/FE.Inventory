import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, map, startWith } from 'rxjs';
import { ItemEdit } from 'src/app/models';
import { Catalog } from 'src/app/models/catalog';
import { ItemService } from 'src/app/services';
import { CatalogService } from 'src/app/services/catalog.service';
import { UploadImageService } from 'src/app/services/upload-image.service';

@Component({
  selector: 'app-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.css'],
})
export class EditItemComponent {
  itemForm!: FormGroup;
  itemId!: string;
  img!: string;
  catalogs!: Catalog[];
  selectedValue!: number;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private catalogService: CatalogService,
    private uploadImage: UploadImageService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.itemForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      imageUrl: new FormControl(''),
      catalogId: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.itemId = params['id'];
    });

    this.img =
      'http://res.cloudinary.com/dhnoew5bj/image/upload/v1688537725/No-Image-Placeholder.svg_o0smur.png';

    this.getCatalog();
  }

  ngAfterViewInit() {
    if (this.itemId != null) {
      this.itemService.getById(this.itemId).subscribe(
        (values) => {
          if (values.imageUrl != '') this.img = values.imageUrl;
          this.itemForm.patchValue({
            name: values.name,
            description: values.description,
            imageUrl: values.imageUrl != '' ? values.imageUrl : this.img,
            catalogId: values.catalog.id,
          });
          this.selectedValue = values.catalog.id;
        },
        (error: any) => {
          console.log(error);
        }
      );
    } else {
      this.itemForm.patchValue({
        imageUrl: this.img,
      });
    }
  }

  getCatalog() {
    this.catalogService.getListCatalog().subscribe(
      (value) => {
        this.catalogs = value;
      },
      (error: any) => {
        if (error.status != 404)
          this.toastr.error(
            'Something went wrong! Get catalog list failed',
            'Error'
          );
      }
    );
  }

  onFileSelected(event: Event) {
    this.isLoading = true;
    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.uploadImage.uploadImg(file!).subscribe(
        (response) => {
          console.log(response);
          this.img = response.url;
          this.itemForm.patchValue({
            imageUrl: response.url,
          });
          this.isLoading = false;
        },
        (error: any) => {
          this.toastr.warning(
            'Upload image error, please try again!',
            'Upload error'
          );
          console.log(error);
        }
      );
    }
  }

  submitItem() {
    const data: ItemEdit = {
      name: this.itemForm.value.name,
      description: this.itemForm.value.description,
      imageUrl: this.itemForm.value.imageUrl,
      catalogId: parseInt(this.itemForm.value.catalogId),
    };

    if (this.itemId != null) {
      this.itemService.updateItem(this.itemId, data).subscribe(
        (response) => {
          this.toastr.success(
            response.messages[0].value,
            response.messages[0].key
          );
          this.router.navigate(['/item/' + this.itemId]);
        },
        (error: any) => {
          if (error.messages[0])
            this.toastr.error(error.messages[0].value, error.messages[0].key);
          else this.toastr.error('Something went wrong!', 'Error');
          this.router.navigate(['/item' + this.itemId]);
        }
      );
    } else {
      this.itemService.addItem(data).subscribe(
        (resp) => {
          this.toastr.success(resp.body[0].value, resp.body[0].key);
          this.router.navigate(['/' + resp.headers.get('Location')]);
        },
        (error: any) => {
          if (error.messages[0])
            this.toastr.error(error[0].value, error[0].key);
          else this.toastr.error('Something went wrong!', 'Error');
          this.router.navigate(['/item']);
        }
      );
    }
  }
}