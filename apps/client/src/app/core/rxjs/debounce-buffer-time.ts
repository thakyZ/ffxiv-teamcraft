import { Observable, OperatorFunction } from 'rxjs';
import { buffer, debounceTime, shareReplay, tap } from 'rxjs/operators';

export function debounceBufferTime<T>(
  duration: number
): OperatorFunction<T, T[]> {
  return (source: Observable<T>) => {
    const sharedSource = source.pipe(shareReplay({ bufferSize: 1, refCount: true }));
    return sharedSource.pipe(
      buffer(sharedSource.pipe(
        debounceTime(duration)
      ))
    );
  };
}
