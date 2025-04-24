import { Component, input, output } from '@angular/core';

import { Place } from './place.model';
import { PlacesService } from './places.service';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [],
  templateUrl: './places.component.html',
  styleUrl: './places.component.css',
})
export class PlacesComponent {
  places = input.required<any>();
  selectPlace = output<Place>();

  constructor(private placesService: PlacesService){}

  onSelectPlace(place: Place) {
    this.placesService.addPlaceToUserPlaces(place)
    .subscribe({
      next: (places)=> console.log(places)
    });
    this.selectPlace.emit(place);
  }
}
