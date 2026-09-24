import { Data } from "./api-response.interface";
import { LazyParamsInterface } from "./lazy-params.interface";

export interface LazyDataInterface<T> {
    lazyParams: LazyParamsInterface,
    data: Data<T>
}