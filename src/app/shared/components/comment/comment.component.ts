import { Component, Input } from '@angular/core';

import { Comment } from '../../models/comment.model';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  standalone: true,
  selector: 'app-comment',
  imports: [TimeAgoPipe],
  templateUrl: './comment.component.html',
})
export class CommentComponent {
  @Input() comment!: Comment;
  @Input() userName = 'Unknown user';
}
