import React, { useState } from "react";

const initialServices = [
  {
    id: 1,
    name: "Проявка пленки",
    category: "Фотопечать",
    price: 500,
  },

  {
    id: 2,
    name: "Печать фотографий",
    category: "Фотопечать",
    price: 15,
  },

  {
    id: 3,
    name: "Фото на документы",
    category: "Документы",
    price: 450,
  },
];

const initialProducts = [
  {
    id: 1,
    name: "Фотопленка Kodak",
    category: "Фотопленки",
    price: 1200,
    quantity: 20,
  },

  {
    id: 2,
    name: "Фотоаппарат Canon",
    category: "Фотоаппараты",
    price: 95000,
    quantity: 3,
  },

  {
    id: 3,
    name: "Фотоальбом",
    category: "Альбомы",
    price: 1800,
    quantity: 15,
  },
];

export default function EmployeeCatalogManager() {
  const [services, setServices] =
    useState(initialServices);

  const [products, setProducts] =
    useState(initialProducts);

  const [serviceForm, setServiceForm] =
    useState({
      name: "",
      category: "",
      price: "",
    });

  const [productForm, setProductForm] =
    useState({
      name: "",
      category: "",
      price: "",
      quantity: "",
    });

  const addService = () => {
    if (
      !serviceForm.name ||
      !serviceForm.category ||
      !serviceForm.price
    ) {
      return;
    }

    const newService = {
      id: Date.now(),
      ...serviceForm,
    };

    setServices([
      ...services,
      newService,
    ]);

    setServiceForm({
      name: "",
      category: "",
      price: "",
    });
  };

  const addProduct = () => {
    if (
      !productForm.name ||
      !productForm.category ||
      !productForm.price ||
      !productForm.quantity
    ) {
      return;
    }

    const newProduct = {
      id: Date.now(),
      ...productForm,
    };

    setProducts([
      ...products,
      newProduct,
    ]);

    setProductForm({
      name: "",
      category: "",
      price: "",
      quantity: "",
    });
  };

  const deleteService = (id) => {
    setServices(
      services.filter(
        (service) => service.id !== id
      )
    );
  };

  const deleteProduct = (id) => {
    setProducts(
      products.filter(
        (product) => product.id !== id
      )
    );
  };

  return (
    <div style={styles.container}>
      <h1>
        Управление товарами и
        услугами
      </h1>

      <div style={styles.grid}>
        {/* УСЛУГИ */}
        <div style={styles.block}>
          <h2>Услуги</h2>

          <div style={styles.form}>
            <input
              placeholder="Название услуги"
              value={serviceForm.name}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  name: e.target.value,
                })
              }
            />

            <input
              placeholder="Категория"
              value={serviceForm.category}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  category:
                    e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Цена"
              value={serviceForm.price}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  price:
                    e.target.value,
                })
              }
            />

            <button
              style={styles.addButton}
              onClick={addService}
            >
              Добавить услугу
            </button>
          </div>

          <div style={styles.list}>
            {services.map((service) => (
              <div
                key={service.id}
                style={styles.card}
              >
                <div>
                  <h3>
                    {service.name}
                  </h3>

                  <p>
                    {
                      service.category
                    }
                  </p>

                  <p>
                    {service.price} ₽
                  </p>
                </div>

                <button
                  style={
                    styles.deleteButton
                  }
                  onClick={() =>
                    deleteService(
                      service.id
                    )
                  }
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ТОВАРЫ */}
        <div style={styles.block}>
          <h2>Товары</h2>

          <div style={styles.form}>
            <input
              placeholder="Название товара"
              value={productForm.name}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  name: e.target.value,
                })
              }
            />

            <input
              placeholder="Категория"
              value={
                productForm.category
              }
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  category:
                    e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Цена"
              value={productForm.price}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  price:
                    e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Количество"
              value={
                productForm.quantity
              }
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  quantity:
                    e.target.value,
                })
              }
            />

            <button
              style={styles.addButton}
              onClick={addProduct}
            >
              Добавить товар
            </button>
          </div>

          <div style={styles.list}>
            {products.map((product) => (
              <div
                key={product.id}
                style={styles.card}
              >
                <div>
                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    {
                      product.category
                    }
                  </p>

                  <p>
                    {product.price} ₽
                  </p>

                  <p>
                    Остаток:{" "}
                    {
                      product.quantity
                    }
                  </p>
                </div>

                <button
                  style={
                    styles.deleteButton
                  }
                  onClick={() =>
                    deleteProduct(
                      product.id
                    )
                  }
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "20px",
  },

  block: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  card: {
    background: "#f1f5f9",
    padding: "15px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  addButton: {
    background: "#1976d2",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  deleteButton: {
    background: "#d32f2f",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};