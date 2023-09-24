import { existsSync, promises } from "fs";


/* por parámetro al constructor le paso la ruta del archivo a utilizar */
class ProductManager {
    constructor(path) {
        this.path = path
    }

    async getProducts(queryObject) {
        /* extraigo la propiedad limit de queeryObjet
        si queryObject tiene esa propiedad, la guarda en la constante limit
        si no la tiene limit va a ser undefined*/
        const {limit} = queryObject
        try {
            /* pregunto si existe el archivo
            si existe lo leo y lo guardo en una variable, y retorno esa variable parseada a objeto JS
            si no existe, retorno un array vacio */
            if (existsSync(this.path)){
                const productsFile= await promises.readFile(this.path, 'utf-8')
                /* return JSON.parse(productsFile) */
                const productsParseado= JSON.parse(productsFile)
                /* hago un condicional: si hay valor para limit retorno el array sliceado desde
                el indice 0 al indice de limit (no incluye el último índice); 
                si limit es undefined, retorno todo el array de prod */
                return limit? productsParseado.slice(0, +limit) : productsParseado
            }else {
                //console.log([])
                return []
            }
        }
        catch (error) {
            return error
        }
    }



    async addProduct(product) {
        try {
            /* hago un desestructuring del product que paso por parámetro para verificar que se incluyeron 
            todos los parámetros */
            const {title, description, price, thumbnail, code, stock} = product
            if (!title || !description || !price || !thumbnail || !stock || !code) {
                console.log("Warning! All fields must be filled")
                return
            }

            /* hago un await para esperar la respuesta del getProducts con el que traigo la info del archivo */
            const products = await this.getProducts({})

            /* genero el id */
            let id 
            if(!products.length){
                id = 1
            } else {
                id = products[products.length-1].id + 1
            }
            

            /* verifico que no exista el código que estoy queriendo ingresar */
            const isCodeAlreadyAdded = products.some((prod)=> prod.code === code)
            if (isCodeAlreadyAdded) {
                console.log("Warning! The product code already exists")
                return
            }

            /* creo un nuevo producto con el id mas el producto que pasé por parametro al metodo */
            const newProduct = {id, ...product}

            /* pusheo el nuevo producto al array */
            products.push(newProduct)

            /* hago un segundo await para sobreescribir el archivo */
            await promises.writeFile(this.path, JSON.stringify(products))
            console.log('Product succesfully added')
        }
        catch (error) {
            console.log(error)
            return error
        }
    }



    async getProductById(id) {
        try {
            /* hago un await para esperar la respuesta del getProducts con el que traigo la info del archivo */
            const products = await this.getProducts({})

            /* hago un find para encontrar el producto que coincida con el id y lo guardo en una variable */
            const productSearched = products.find(p=> p.id == id)            
            if (productSearched) {                
                return productSearched            
            }
        }
        catch (error) {
            return error
        }
    }



    async deleteProductById(id) {
        try {
            /* hago un await para esperar la respuesta del getProducts con el que traigo la info del archivo */
            const products = await this.getProducts({})

            /* con un some verifico si el id del producto existe o no */
            const idExists = products.find(p=> p.id === id)  

            let message = ''

            /* si el id existe, hago un filter para guardar en un array todos los demas productos
            y uso ese array para sobreescribir el archivo, usando await */
            if (!idExists){
                console.log(`Product with id ${id} does not exist`) ;
                
            
                /* si el archivo no existe, retorno un error */
            }else {
                const newArrayProducts = products.filter(p=> p.id !== id)
                await promises.writeFile(this.path, JSON.stringify(newArrayProducts))
                console.log(`Product with id ${id} was succesfully deleted`);
            }
            
            }
        catch (error) {
            return error
        }
    }



    async updateProduct(id, update) {
        try {
            
            /* hago un await para esperar la respuesta del getProducts con el que traigo la info del archivo */
            const products = await this.getProducts({})            

            /* hago un findIndex para encontrar el índice del producto correspondiente al id */
            const prodIndex = products.findIndex(p=> p.id == id)
            
            /* si ese infice es encontrado, recorro con un for cada key del objeto update */
            if (prodIndex !== -1) {
                for (const key in update) {
                    /* si key es code y el code del producto a ser updateado es distinto al code del objeto que 
                    va a updatear, hago un some para saber si ya hay algun producto en el array que coincida con
                    el code del objeto update */
                    if (key == "code" && products[prodIndex].code !== update.code) {                        
                        const isCodeAlreadyAdded = products.some((prod)=> prod.code === update.code)
                        /* si coinciden los códigos, sale un mensaje de error por codigo repetido */
                        if (isCodeAlreadyAdded) {
                            console.log("Warning! The product code already exists.\nGenerate a code")
                            return
                        }                        
                    }
                    /* sugp dentro del for
                    si el producto buscado por indice tiene la propiedad de key,
                    se reemplaza el valor del objeto del array por el valor del objeto update */                    
                    if (products[prodIndex].hasOwnProperty(key)){
                        products[prodIndex][key] = update[key]
                        
                    /* si el objeto del array no tiene alguna propiedad de las que tiene key
                    sale un mensaje de error por consola que indica que la propiedad que se quiere
                    modificar no existe */ 
                    }else{
                        console.log('One of the properties that you want to modify does not exist in the dB')
                        return
                    }                                            
                }
                /* hago un segundo await para sobreescribir el archivo */        
                await promises.writeFile(this.path, JSON.stringify(products))
                console.log(`Product with id ${id} was succesfully updated`)                

            /* si no encuentra el obejto del array productos con el id pasado por parámetro al método updateProduct,
            sale un mensaje de error por consola que indica que ese producto con ese id no existe */
            }else {
                console.log(`The product with id ${id} does not exist`)
            }


        }
        catch (error) {
            return error
        }
    }
}




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//TESTING

const prod1 = {    
    title: "producto1",
    description: "este es el producto 1",
    price: 200,
    thumbnail: "sin imagen1",
    code: "abc121",    
    stock: 25    
}

const prod2 = {    
    title: "producto2",
    description: "este es el producto 2",
    price: 300,
    thumbnail: "sin imagen2",
    code: "abc122",    
    stock: 20    
}

const prod3 = {    
    title: "producto3",
    description: "este es el producto 3",
    price: 500,
    thumbnail: "sin imagen3",
    code: "abc123",    
    stock: 10    
}

const prod4 = {    
    title: "producto4",
    description: "este es el producto 4",
    price: 100,
    thumbnail: "sin imagen4",
    code: "abc124",    
    stock: 30    
}

const prod5 = {    
    title: "producto5",
    description: "este es el producto 5",
    price: 100,
    thumbnail: "sin imagen5",
    code: "abc125",    
    stock: 30    
}

const prod6 = {    
    title: "producto6",
    description: "este es el producto 6",
    price: 100,
    thumbnail: "sin imagen6",
    code: "abc126",    
    stock: 30    
}

const prod7 = {    
    title: "producto7",
    description: "este es el producto 7",
    price: 100,
    thumbnail: "sin imagen7",
    code: "abc127",    
    stock: 30    
}

const prod8 = {    
    title: "producto8",
    description: "este es el producto 8",
    price: 100,
    thumbnail: "sin imagen8",
    code: "abc128",    
    stock: 30    
}

const prod9 = {    
    title: "producto9",
    description: "este es el producto 9",
    price: 100,
    thumbnail: "sin imagen9",
    code: "abc129",    
    stock: 30    
}

const prod10 = {    
    title: "producto10",
    description: "este es el producto 10",
    price: 100,
    thumbnail: "sin imagen10",
    code: "abc1210",    
    stock: 30    
}





async function test() {
    const manager = new ProductManager("./data/myprods.json")
    
    /* este primer LLAMADO A GETPRODUCTS devuelve un array vacío */
    //console.log( await manager.getProducts())

    
    /* AGREGAR PRODUCTO */
    /* await manager.addProduct({
        title: "producto prueba1",
        description: "esto es un producto prueba",
        price: 200,
        thumbnail: "sin imagen",
        code: "abc122",    
        stock: 25
    })
    console.log( await manager.getProducts()) */
    

    /* GET PRODUCT BY ID */
    //console.log(await manager.getProductById(2))


    /* DELETE PRODUCT BY ID */
    /* await manager.deleteProductById(2)
    console.log( await manager.getProducts()) */


    /* UPDATE PRODUCT */
    /* await manager.updateProduct(1,{        
        title: "Producto Lindo",
        description: "Mi producto favorito",        
        code: "abc122"              
    })
    console.log( await manager.getProducts()) */


    /* AGREGO 10 PRODUCTOS */
    await manager.addProduct(prod1)
    await manager.addProduct(prod2)
    await manager.addProduct(prod3)
    await manager.addProduct(prod4)
    await manager.addProduct(prod5)
    await manager.addProduct(prod6)
    await manager.addProduct(prod7)
    await manager.addProduct(prod8)
    await manager.addProduct(prod9)
    await manager.addProduct(prod10)

}
   


test()

export const manager = new ProductManager("./data/myprods.json");