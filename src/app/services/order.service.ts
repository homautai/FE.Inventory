import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AddOrder, AddOrderDetail, Order, OrderPagination } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = environment.apiUrl + '/order';

  constructor(private http: HttpClient) {}

  getPagination(params: any): Observable<OrderPagination> {
    return this.http.get<OrderPagination>(`${this.apiUrl}`, { params });
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/update-status`, null);
  }

  cancelOrder(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/cancel`);
  }

  addOrder(): Observable<any> {
    let data = this.getAddOrder();
    return this.http.post(`${this.apiUrl}`, data, { observe: 'response' });
  }

  initAddOrder() {
    let order: AddOrder = {
      orderTotal: 0,
      details: [],
    };
    return order;
  }

  getAddOrder() {
    let json = localStorage.getItem('order');
    return json ? (JSON.parse(json) as AddOrder) : null;
  }

  setAddOrder(order: AddOrder) {
    localStorage.setItem('order', JSON.stringify(order));
  }

  addItemToOrder(itemId: string, quantity: number, price: number) {
    let detail: AddOrderDetail = {
      itemId: itemId,
      quantity: quantity,
      price: price,
      total: quantity * price,
    };

    let addOrder = this.getAddOrder();
    if (addOrder == null) addOrder = this.initAddOrder();
    addOrder.details.push(detail);
    addOrder.orderTotal += detail.total;
    this.setAddOrder(addOrder);
  }

  removeAddOrder() {
    localStorage.removeItem('order');
  }

  removeItemFromOrder(itemId: string): boolean {
    let order = this.getAddOrder();
    if (order == null) return false;
    let index = order?.details.findIndex((x) => x.itemId == itemId) ?? 0;
    if (index < 0) return false;

    let total = order?.details[index].total ?? 0;
    order.orderTotal -= total;
    order.details.splice(index, 1);

    this.setAddOrder(order!);
    return true;
  }
}