import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Если это уже наш стандартный формат ответа (есть status И data/message),
        // то возвращаем как есть, чтобы не переоборачивать ошибки и спец. ответы.
        if (
          data &&
          typeof data === "object" &&
          "status" in data &&
          ("data" in data || "message" in data)
        ) {
          return data as any;
        }

        // В остальных случаях (например, сущность Property со своим полем status),
        // оборачиваем в стандартный формат ответа.
        return {
          status: "success",
          data,
        };
      })
    );
  }
}
