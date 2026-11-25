import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { GeoLocation } from '../../../core/models/catalog.model';

export interface MapMarker {
  location: GeoLocation;
  label?: string;
  color?: 'red' | 'blue' | 'green' | 'orange';
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  template: '<div #mapContainer class="map-picker" aria-label="Location map"></div>',
  styleUrl: './map-picker.component.scss'
})
export class MapPickerComponent implements OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
  @Input() value: GeoLocation | null = null;
  @Input() markers: MapMarker[] = [];
  @Input() selectable = true;
  @Output() valueChange = new EventEmitter<GeoLocation>();

  private map?: L.Map;
  private selectedMarker?: L.Marker;
  private markerLayers: L.Marker[] = [];

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      this.renderMarkers();
      if (changes['value']) this.moveSelectedMarker();
    }
  }

  private initializeMap(): void {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png'
    });
    this.map = L.map(this.mapContainer.nativeElement).setView([21.0285, 105.8542], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
    if (this.selectable) {
      this.map.on('click', (event: L.LeafletMouseEvent) => {
        const location = { longitude: event.latlng.lng, latitude: event.latlng.lat };
        this.value = location;
        this.valueChange.emit(location);
        this.moveSelectedMarker();
      });
    }
    this.renderMarkers();
    this.moveSelectedMarker();
  }

  private renderMarkers(): void {
    if (!this.map) return;
    this.markerLayers.forEach((marker) => marker.remove());
    this.markerLayers = [];
    for (const markerData of this.markers) {
      const latLng: L.LatLngTuple = [markerData.location.latitude, markerData.location.longitude];
      const marker = L.marker(latLng, { title: markerData.label }).addTo(this.map);
      if (markerData.label) marker.bindPopup(markerData.label);
      this.markerLayers.push(marker);
    }
  }

  private moveSelectedMarker(): void {
    if (!this.map || !this.value) return;
    const latLng: L.LatLngTuple = [this.value.latitude, this.value.longitude];
    if (this.selectedMarker) {
      this.selectedMarker.setLatLng(latLng);
    } else {
      this.selectedMarker = L.marker(latLng).addTo(this.map);
    }
    this.map.panTo(latLng);
  }
}
