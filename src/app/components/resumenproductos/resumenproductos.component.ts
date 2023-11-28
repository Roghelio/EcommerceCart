import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/servicios/producto.service';

@Component({
  selector: 'app-resumenproductos',
  templateUrl: './resumenproductos.component.html',
  styleUrls: ['./resumenproductos.component.css']
})
export class ResumenproductosComponent implements OnInit {
  productosCarri: any[] = [];
  products: any[] = [];
  monto: number = 0;
  imagesUrl = 'https://olympus.arvispace.com/assets/img/prods-img/';
  suple = 0;
  acce = 0;
  alim = 0;
  ropa = 0;
  productoMayor: any[] = [];
  productosRelacionados: any[] = Array(4);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.productosCart$.subscribe(
      (datos) => {
        this.productosCarri = datos.productos;
        //this.monto = datos.monto;
        console.log('Datos del carrito:', this.productosCarri);
        //console.log('Monto:', this.monto);
      },
      (error: any) => {
        console.error('Error al obtener datos del carrito:', error);
      }
    );

      this.productService.getProducts().subscribe(
        (respuesta) => {
          this.products = respuesta;
          console.log("la respuesta de los productos es: ", this.products);
        }
      )

    this.calcularMonto();
    /*this.productosRelacion();*/
  }

  calcularMonto() {
    this.monto = this.productosCarri.reduce((total, producto) => total + producto.price * producto.cantidad, 0);
    console.log("el monto segun calcularMonto es : ", this.monto);
  }

  eliminarProducto(index: number) {
    this.productService.eliminarProducto(index);
    this.calcularMonto();
    this.productService.saveCartToLocalStorage(this.productosCarri, this.monto);
  }

  cantidadProducto(event: any, index: number){
    const nuevaCantidad = parseInt(event.target.value, 10);
    this.productosCarri[index].cantidad = nuevaCantidad;
    this.calcularMonto();

    if(this.productosCarri[index].cantidad == 0){
      this.productosCarri.splice(index, 1);
      this.calcularMonto();
    }
  }

  /*productosRelacion(){
    this.productosCarri.forEach(element => {
      if(element.id_category == 6){
        this.suple++;
      }else if(element.id_category == 2){
        this.ropa++;
      }else if(element.id_category == 5){
        this.alim++;
      }else if(element.id_category == 3){
        this.acce++;
      }
    });

    this.productoMayor = [
      {categoria: "Suplementos", cantidad: this.suple},
      {categoria: "Accesorios de entrenamiento", cantidad: this.acce},
      {categoria: "Bebidas y alimentos", cantidad: this.alim},
      {categoria: "Ropa y calzado", cantidad: this.ropa}
    ];

    console.log(this.productoMayor);

    const categoriaConMayorCantidad = this.productoMayor.reduce((categoriaMax, producto) => {
      if (!categoriaMax || producto.cantidad > categoriaMax.cantidad) {
        return producto;
      } else {
        return categoriaMax;
      }
    }, null);

    console.log('Categoría con mayor cantidad:', categoriaConMayorCantidad.categoria);

  }*/
}
