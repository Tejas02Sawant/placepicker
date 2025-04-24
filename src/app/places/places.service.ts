import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, map, retry, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  //private custStorage = inject(Storage);
  constructor(private httpClient: HttpClient, private errorService: ErrorService){}

  loadedUserPlaces = this.userPlaces.asReadonly();
  //private storage: Storage | null = null;
  

  loadAvailablePlaces() {
    const url = 'http://localhost:3000/places';
    const message = 'Something went wrong fetching the available places. Please try again later.'

    return this.fetchplaces(url, message);
  }

  loadUserPlaces() {
    const url = 'http://localhost:3000/user-places';
    const message = 'Something went wrong fetching the user places. Please try again later.'

    return this.fetchplaces(url, message).pipe(tap({ next: (userPlaces)=> this.userPlaces.set(userPlaces) }));
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();
    if(!prevPlaces.some(
      (existingPlace)=> existingPlace.id === place.id)){
      this.userPlaces.set([...prevPlaces, place]);
    }
    return this.httpClient.put<{userPlaces: Place[]}>('http://localhost:3000/user-places', {placeId: place.id}).pipe(map((resData)=> resData.userPlaces), 
    catchError((error)=> throwError(()=> { 
      this.userPlaces.set(prevPlaces);
      this.errorService.showError('Failed to store selected places');
      new Error('Failed to store selected places');
    })));
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();
    if(prevPlaces.some((existingPlace)=> existingPlace.id === place.id)){
      this.userPlaces.set(prevPlaces.filter((existingPlace)=> existingPlace.id !== place.id));
    }
    return this.httpClient.delete('http://localhost:3000/user-places/'+ place.id).pipe(catchError((error) => //EMPTY));
      throwError(()=> {
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('Something went wrong. Please try afetr sometime.');
      })));
  }

  private fetchplaces(url: string, message: string){
    return this.httpClient.get<{places: Place[]}>(url).pipe( map((resData)=> resData.places), 
    retry({
      count: 2,
      delay: 2000
    }),
    catchError(()=> throwError(()=> new Error(message))));
  }
}
