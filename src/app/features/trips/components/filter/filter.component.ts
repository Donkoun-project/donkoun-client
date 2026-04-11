import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Output() filterChanged = new EventEmitter<any>();

  filterForm: FormGroup;
  focusedFrom = false;
  focusedTo = false;

  transportTypes = [
    { value: '',      label: 'Tous' },
    { value: 'PLANE', label: 'Avion' },
    { value: 'BUS',   label: 'Bus' },
    { value: 'TRAIN', label: 'Train' },
    { value: 'BOAT',  label: 'Bateau' },
    { value: 'CAR',   label: 'Voiture' },
    { value: 'TRUCK', label: 'Camion' },
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      origin:        [''],
      destination:   [''],
      dateFrom:      [''],
      dateTo:        [''],
      transportType: [''],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.filterChanged.emit(this.filterForm.value);
  }

  reset(): void {
    this.filterForm.reset({ origin: '', destination: '', dateFrom: '', dateTo: '', transportType: '' });
    this.focusedFrom = false;
    this.focusedTo = false;
    this.filterChanged.emit(this.filterForm.value);
  }
}
