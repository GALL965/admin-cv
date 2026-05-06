import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { WorkExperience } from '../models/work-experience/work-experience.model';
import { WorkExperienceService } from '../services/work-experience/work-experience.service';

@Component({
  selector: 'app-admin-workexperience',
  templateUrl: './admin-workexperience.component.html',
  styleUrls: ['./admin-workexperience.component.css']
})
export class AdminWorkexperienceComponent {
  jobs: WorkExperience[] = [];
  myJob: WorkExperience = this.resetJob();
  accomplishmentsText = '';

  constructor(private workService: WorkExperienceService) {
    this.loadWorkExperience();
  }

  resetJob(): WorkExperience {
    this.accomplishmentsText = '';
    return {
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      accomplishments: []
    };
  }

  private normalizeAccomplishments(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map(v => (typeof v === 'string' ? v.trim() : ''))
        .filter(Boolean);
    }
    if (typeof value === 'string') {
      return value
        .split(/\r?\n|,/g)
        .map(v => v.trim())
        .filter(Boolean);
    }
    return [];
  }

  private formatAccomplishments(value: unknown): string {
    return this.normalizeAccomplishments(value).join('\n');
  }

  loadWorkExperience() {
    this.workService.getWorkExperience().snapshotChanges().pipe(
      map((changes: any) =>
        changes.map((c: any) => {
          const data = c.payload.doc.data() as any;
          return {
            id: c.payload.doc.id,
            ...(data as WorkExperience),
            accomplishments: this.normalizeAccomplishments(data?.accomplishments)
          };
        })
      )
    ).subscribe((data: WorkExperience[]) => {
      this.jobs = data;
    });
  }

  saveWorkExperience() {
    const jobToSave: WorkExperience = {
      ...this.myJob,
      accomplishments: this.normalizeAccomplishments(this.accomplishmentsText)
    };

    if (this.myJob.id) {
      this.workService.workExperienceRef.doc(this.myJob.id).update(jobToSave)
        .then(() => {
          alert('Experiencia actualizada');
          this.myJob = this.resetJob();
        });
    } else {
      this.workService.createWorkExperience(jobToSave)
        .then(() => {
          alert('Experiencia guardada');
          this.myJob = this.resetJob();
        });
    }
  }

  editWorkExperience(job: WorkExperience) {
    this.myJob = { ...job, accomplishments: this.normalizeAccomplishments(job.accomplishments) };
    this.accomplishmentsText = this.formatAccomplishments(this.myJob.accomplishments);
  }

  deleteWorkExperience(id?: string) {
    if (id) {
      this.workService.deleteWorkExperience(id)
        .then(() => alert('Experiencia eliminada'));
    }
  }
}
