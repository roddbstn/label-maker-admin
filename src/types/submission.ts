export interface Submission {
    id: string;
    type: 'waitlist' | 'feedback';
    email?: string;
    feedback?: string;
    organization?: string;
    createdAt: string;
}
