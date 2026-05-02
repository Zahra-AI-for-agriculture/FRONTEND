import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
// import { CommunityService } from '../../services/community.service';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css']
})
export class CommunityComponent implements OnInit {
  posts: any[] = [];
  advisors: any[] = [];
  selectedPost: any = null;
  replies: any[] = [];
  isLoading = true;
  activeTab = 'forum';
  showNewPost = false;

  newPost = { title: '', body_ar: '', crop: '', region: '' };
  newReply = { body_ar: '' };

  communityService = {
    getPosts: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getAdvisors: () => ({ subscribe: (cb: any) => cb.next({}) }),
    getReplies: (id: any) => ({ subscribe: (cb: any) => cb.next([]) }),
    createPost: (data: any) => ({ subscribe: (cb: any) => cb.next({}) }),
    addReply: (id: any, data: any) => ({ subscribe: (cb: any) => cb.next({}) }),
    messageAdvisor: (id: any) => ({ subscribe: (cb: any) => cb.next({}) })
  };

  constructor() {}

  ngOnInit() {
    forkJoin({
      posts:    this.communityService.getPosts() as any,
      advisors: this.communityService.getAdvisors() as any,
    }).subscribe({
      next: (r: any) => {
        this.posts    = r.posts || [];
        this.advisors = r.advisors?.advisors || [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  selectPost(post: any) {
    this.selectedPost = post;
    this.communityService.getReplies(post.id).subscribe({
      next: (r: any) => { this.replies = r || []; }
    });
  }

  createPost() {
    if (!this.newPost.title || !this.newPost.body_ar) return;
    this.communityService.createPost(this.newPost).subscribe({
      next: (p: any) => {
        this.posts.unshift(p);
        this.showNewPost = false;
        this.newPost = { title:'', body_ar:'', crop:'', region:'' };
      }
    });
  }

  addReply() {
    if (!this.newReply.body_ar || !this.selectedPost) return;
    this.communityService.addReply(this.selectedPost.id, this.newReply)
      .subscribe({
        next: (r: any) => {
          this.replies.push(r);
          this.newReply = { body_ar: '' };
        }
      });
  }

  contactAdvisor(id: number) {
    this.communityService.messageAdvisor(id).subscribe({});
  }
}