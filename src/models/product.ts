
export interface IProduct {
    name: String;
    code: String;
    price: string;
    old_price: string;
    imageUrl: String;
    photo_id: String;
    offer: String;
    brand: String;
    sponsored: String;
    recommend: String;
    category: {
        type: String;
    };
    department_id: String;
    category_id: String;
    aisle_id: String;
    stock: Number;
    description: {
        detail: String;
        size: String;
        origin: String;
    };
    nutrition: {
        energy: String;
        fat: String;
        saturates: String;
        salt: String;
    };
    publish: String;
}
export type Product = IProduct;