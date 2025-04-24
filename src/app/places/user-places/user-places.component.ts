import { Component, DestroyRef, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  places = this.placesService.loadedUserPlaces;
  error = signal('');
  isFetching = signal(false);
    
  constructor(private placesService: PlacesService, private destRef: DestroyRef){}

  ngOnInit(): void {
    const subscription = this.placesService.loadUserPlaces()
    .subscribe({
      complete: () => this.isFetching.set(false),
      error: (error: Error) => {
        console.log(error)
        this.error.set(error.message);
      }
    })

    this.destRef.onDestroy(
      ()=>{
        subscription.unsubscribe();
      }
    );
  }

  removePlace(place: Place){
    const subscription = this.placesService.removeUserPlace(place).subscribe();

    this.destRef.onDestroy(
      ()=>{
        subscription.unsubscribe();
      }
    );
  }
}
