import { Component } from '@angular/core';
import { EducationService } from '../services/education-service/education.service';
import { Education } from '../models/education/education.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-education',
  templateUrl: './admin-education.component.html',
  styleUrls: ['./admin-education.component.css']
})
export class AdminEducationComponent {
  educations: Education[] = [];
  myEducation: Education = this.resetEducation();
  accomplishmentsText = '';

  constructor(private educationService: EducationService) {
    this.loadEducation();
  }

  resetEducation(): Education {
    this.accomplishmentsText = '';
    return {
      degree: '',
      fieldOfStudy: '',
      institution: '',
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

  loadEducation() {
    this.educationService.getEducation()
      .pipe(
        map(changes =>
          changes.map(c => ({
            id: c.payload.doc.id,
            ...(c.payload.doc.data() as any),
            accomplishments: this.normalizeAccomplishments((c.payload.doc.data() as any)?.accomplishments)
          }))
        )
      )
      .subscribe(data => this.educations = data);
  }

  saveEducation() {
    const eduToSave: Education = {
      ...this.myEducation,
      accomplishments: this.normalizeAccomplishments(this.accomplishmentsText)
    };

    if (this.myEducation.id) {
      this.educationService.updateEducation(this.myEducation.id, eduToSave)
        .then(() => {
          alert('Educación actualizada');
          this.myEducation = this.resetEducation();
        });
    } else {
      this.educationService.createEducation(eduToSave)
        .then(() => {
          alert('Educación guardada');
          this.myEducation = this.resetEducation();
        });
    }
  }

  editEducation(edu: Education) {
    this.myEducation = { ...edu, accomplishments: this.normalizeAccomplishments(edu.accomplishments) };
    this.accomplishmentsText = this.formatAccomplishments(this.myEducation.accomplishments);
  }

  deleteEducation(id?: string) {
    if (!id) return;
    this.educationService.deleteEducation(id)
      .then(() => alert('Educación eliminada'));
  }
}
