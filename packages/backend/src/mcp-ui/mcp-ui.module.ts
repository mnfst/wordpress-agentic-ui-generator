import { Module } from '@nestjs/common';
import { PostsListComponent } from './components/posts-list.component';
import { PostDetailComponent } from './components/post-detail.component';

@Module({
  providers: [PostsListComponent, PostDetailComponent],
  exports: [PostsListComponent, PostDetailComponent],
})
export class McpUiModule {}
