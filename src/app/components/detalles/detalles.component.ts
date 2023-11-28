import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/servicios/cart.service';
import { ProductService } from 'src/app/servicios/producto.service';

@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.css']
})

export class DetallesComponent implements OnInit {
  urlimg = "https://olympus.arvispace.com/assets/img/prods-img/";
  id_articulo: string = '';
  data_art: any[] = [];
  productos: any[] = [];
  subtotal: number = 0;
  aplicarEstilo: boolean = false;
  mostrarCarrito: boolean = false;

  //Manejar el estado del input
  valorInput: number = 1;
  inputDeshabilitado: boolean = false;

  constructor(private service: CartService,
    private activeRoute: ActivatedRoute,
    private productService: ProductService,
    private snackBar: MatSnackBar) { }

  //Agregar/sumar +1 a la cantidad del input
  add1() {
    this.valorInput = +this.valorInput + 1;
    this.inputDeshabilitado = false;
  }

  //Descontar/restar -1 a la cantidad del input
  less() {
    if (this.valorInput < 1) {
      this.inputDeshabilitado = true;
    } else {
      this.valorInput = this.valorInput - 1;
      this.inputDeshabilitado = false;
    }
  }

  //Hacer la validacion / aceptar solo numeros
  soloNumeros(event: KeyboardEvent) {
    const teclaPresionada = event.key;
    const esNumero = /^[0-9]+$/.test(teclaPresionada);
    if (!esNumero) {
      event.preventDefault();
    }
  }

  ngOnInit(): void {

    //Capturar el valor que viene de la url
    const x = this.activeRoute.snapshot.paramMap.get('id');
    this.id_articulo = x!.toString();

    //Mandar a traer los datos del articulo selecionado
    this.service.datosArticulo(this.id_articulo).subscribe({
      next: (resultData) => {

        //Validar el objeto retornado es un array
        if (Array.isArray(resultData)) {
          this.data_art = resultData;
          //Hacer el calculo de los articulos que tienen descuento
          this.data_art.forEach(element => {
            if (element.descuento == 1) {
              element.nuevoprecio = element.price - (element.porcentaje / 100) * element.price;
            }
          });
        }
      }, error: (error) => {
        console.log(error);
      }
    });

    const cartData = this.productService.getCartFromLocalStorage();
    if (cartData) {
      this.productos = cartData.productos;
      this.actualizarSubtotal();
      //this.aplicarEstilo = true;
      this.mostrarCarrito = true;
    }
  }

  actualizarSubtotal(): void {
    this.subtotal = this.productos.reduce((total, producto) => total + (producto.cantidad * producto.price), 0);
  }

  //Agregar item al carrito
  agregarAlCarrito(qty: string) {
    const x = +qty;

    if(x < 1){
      this.notificarCarritoVacio(2);
    } else {

    const productoExistente = this.productos.find(p => p.id === this.data_art[0].id);

    if (productoExistente) {
      productoExistente.cantidad++;
    } else {
      const nuevoProducto = {
        id: this.data_art[0].id,
        name: this.data_art[0].name,
        price: parseFloat(this.data_art[0].price),
        imageurl: this.data_art[0].imageurl,
        id_category: this.data_art[0].id_category,
        descuento: this.data_art[0].descuento,
        porcentaje: parseFloat(this.data_art[0].porcentaje),
        cantidad: x,
        nuevoprecio: 0
      };
      // Aplicar descuento solo cuando se crea el producto
      if (nuevoProducto.descuento === '1') {
        nuevoProducto.nuevoprecio = this.calcularPrecioConDescuento(nuevoProducto.price, nuevoProducto.porcentaje);
        nuevoProducto.price = nuevoProducto.nuevoprecio || nuevoProducto.price;
        nuevoProducto.price = parseInt(nuevoProducto.price.toFixed(0));
      }
      this.productos.push(nuevoProducto);
      console.log("esto es lo que se está enviando al carrito: ", this.productos);
    }

    this.actualizarSubtotal();
    this.aplicarEstilo = true;
    this.mostrarCarrito = true;

    this.productService.saveCartToLocalStorage(this.productos, this.subtotal);
  }
  }

  calcularPrecioConDescuento(precioOriginal: number, porcentajeDescuento: number): number {
    return precioOriginal - (precioOriginal * porcentajeDescuento / 100);
  }

  closeCar() {
    this.aplicarEstilo = !this.aplicarEstilo;
  }

  eliminarProducto(index: number): void {
    this.productos.splice(index, 1);
    this.actualizarSubtotal();
    if (this.productos.length === 0) {
      this.closeCar();
    }
    this.productService.saveCartToLocalStorage(this.productos, this.subtotal);
  }

  resumenProductos() {
    console.log("tu compra incluye:", this.productos);
    console.log("vas a pagar: ", this.subtotal);
    this.productService.enviarDatos(this.productos, this.subtotal);
    this.productService.saveCartToLocalStorage(this.productos, this.subtotal);
  }

  vaciarCarrito() {
    this.productos = [];
    this.closeCar();
    this.productService.saveCartToLocalStorage(this.productos, this.subtotal);
  }

  openCar() {
    if (this.productos.length > 0) {
      this.aplicarEstilo = !this.aplicarEstilo;
    } else {
      this.notificarCarritoVacio(1);
    }
  }

  notificarCarritoVacio(valida: number) {
    if(valida == 1){
      this.snackBar.open('Tu carrito esta vacio', 'Cerrar', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['notificacion-carrito-vacio'],
      });
    }

    if(valida == 2) {
      this.snackBar.open('Valor en #articulo invalido', 'Cerrar', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['notificacion-carrito-vacio'],
      });
    }
    
  }

  actualizarCantidad(index: number): void {
    this.actualizarSubtotal();
    if (this.productos[index].cantidad === 0) {
      this.productos.splice(index, 1);
    }
    if (this.productos.length === 0) {
      this.closeCar();
    }
  }

}
