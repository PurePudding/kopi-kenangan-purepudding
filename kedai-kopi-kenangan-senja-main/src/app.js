document.addEventListener("alpine:init", () => {
  // Data Produk
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Americano", img: "1.jpg", price: 1000 },
      { id: 2, name: "Hot Chocolate", img: "2.jpg", price: 2000 },
      { id: 3, name: "Hot Milk", img: "3.jpg", price: 3000 },
    ],
  }));

  // Store untuk Keranjang Belanja
  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,

    // Method untuk menambahkan barang ke cart
    add(newItem) {
      // Cek apakah ada barang yang sama di cart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // Jika belum ada / cart masih kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        // Jika barang sudah ada, cek apakah barang beda atau sama dengan yang ada di cart
        this.items = this.items.map((item) => {
          if (item.id !== newItem.id) {
            return item;
          } else {
            // Jika barang sudah ada, tambah quantity dan total
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },

    // Method untuk menghapus barang dari cart
    remove(id) {
      // Ambil item yang mau dihapus berdasarkan id
      const cartItem = this.items.find((item) => item.id === id);

      if (cartItem) {
        // Jika item lebih dari 1, kurangi jumlahnya
        if (cartItem.quantity > 1) {
          this.items = this.items.map((item) => {
            if (item.id !== id) {
              return item;
            } else {
              item.quantity--;
              item.total = item.price * item.quantity;
              this.quantity--;
              this.total -= item.price;
              return item;
            }
          });
        } else {
          // Jika item hanya 1, hapus dari cart
          this.items = this.items.filter((item) => item.id !== id);
          this.quantity--;
          this.total -= cartItem.price;
        }
      }
    },
  });

  // Form validation
  const checkoutButton = document.querySelector("#checkout-button");
  checkoutButton.disabled = true;

  const form = document.querySelector("#checkoutForm"); // ID diperbaiki sesuai dengan HTML

  form.addEventListener("keyup", function () {
    let isFormValid = true; // Anggap semua input sudah diisi

    for (let i = 0; i < form.elements.length; i++) {
      let input = form.elements[i];

      // Cek apakah elemen adalah input dan tidak kosong
      if (input.tagName === "INPUT" && input.value.trim() === "") {
        isFormValid = false;
        break; // Keluar dari loop jika ada input kosong
      }
    }

    if (isFormValid) {
      checkoutButton.disabled = false;
      checkoutButton.classList.remove("disabled");
    } else {
      checkoutButton.disabled = true;
      checkoutButton.classList.add("disabled");
    }
  });

  // Kirim data ketika tombol checkout diklik
  checkoutButton.addEventListener("click", function (e) {
    e.preventDefault();

    // Ambil data form dengan FormData
    const formData = new FormData(form);
    const objData = Object.fromEntries(formData.entries());

    // Tambahkan data pesanan dari Alpine Store (cart)
    objData.items = Alpine.store("cart").items;
    objData.total = Alpine.store("cart").rupiah(Alpine.store("cart").total);

    // Buat pesan WhatsApp
    const message = formatMessage(objData);

    // Kirim ke WhatsApp
    window.open(
      "https://wa.me/6288216559174?text=" + encodeURIComponent(message),
      "_blank"
    );
  });

  // Format untuk WhatsApp
  const formatMessage = (obj) => {
    return `Data Customer
Nama: ${obj.name}
Email: ${obj.email}
Telepon: ${obj.phone}

Data Pesanan:
${obj.items
  .map(
    (item) =>
      ` - ${item.name} (${item.quantity}x ${Alpine.store("cart").rupiah(
        item.total
      )})`
  )
  .join("\n")}

Total: ${obj.total}
  `;
  };

  // Method untuk format Rupiah
  Alpine.store("cart").rupiah = function (number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };
});
