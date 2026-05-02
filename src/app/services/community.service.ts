import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Post, Reply, Advisor } from '../models';

@Injectable({ providedIn: 'root' })
export class CommunityService {

  private readonly API = 'http://20.240.59.225:8000/api/v1/community';

  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API}/posts`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  createPost(data: { title: string; content: string; category?: string }): Observable<Post> {
    return this.http.post<Post>(`${this.API}/posts`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getReplies(postId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.API}/posts/${postId}/replies`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  addReply(postId: number, data: { content: string }): Observable<Reply> {
    return this.http.post<Reply>(`${this.API}/posts/${postId}/replies`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getAdvisors(): Observable<Advisor[]> {
    return this.http.get<Advisor[]>(`${this.API}/advisors`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  messageAdvisor(advisorId: number, data: { message: string }): Observable<unknown> {
    return this.http.post(`${this.API}/advisors/${advisorId}/message`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
