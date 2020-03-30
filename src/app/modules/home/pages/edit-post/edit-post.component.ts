import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, Observable, of } from "rxjs";
import { DatabaseService } from "src/app/shared/services/database/database.service";
import { FormBuilder, FormGroup }                 from "@angular/forms";
import {filter, map, pluck, switchMap, take, tap} from "rxjs/operators";
import { objectExists }                           from "../../../../shared/services/utilites/utilities.service";

@Component({
  selector: "app-edit-post",
  templateUrl: "./edit-post.component.html",
  styleUrls: ["./edit-post.component.scss"],
})
export class EditPostComponent {
  form$: Observable<FormGroup> = this.router.params.pipe(
    pluck("uid"),
    filter(objectExists),
    switchMap((uid) => combineLatest([of(uid), this.database.getPost$(uid)])),
    map(([uid, post]) =>
      this.formBuilder.group({
        uid: post ? post.uid : uid,
        header: post ? post.header : "",
        subheader: post ? post.subheader : "",
        isPublished: post ? post.isPublished : "",
        updatedOn: post ? post.updatedOn : "",
        createdOn: post ? post.createdOn : "",
        prettyUrl: post ? post.prettyUrl : "",
        author: post ? post.author : "",
        previewImageSource: post ? post.previewImageSource : "",
        content: post ? post.content : "",
      })
    )
  );
  errorMessage: string;

  constructor(
    private router: ActivatedRoute,
    private database: DatabaseService,
    private formBuilder: FormBuilder
  ) {}

  onSubmit(blogPostData) {
    blogPostData.uid = blogPostData.prettyUrl;
    console.log('blog post submitted', blogPostData);
    this.database.getPost$(blogPostData.prettyUrl)
      .pipe(
        tap((existingBlogPost) => {
          if (existingBlogPost) {
            this.errorMessage = 'A blog post with that url already exists';
          } else {
            this.errorMessage = '';
            this.database.updatePost(blogPostData);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
