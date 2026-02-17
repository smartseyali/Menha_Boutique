
function updateCartItem(id, delta, isAuth) {
    if (isAuth) {
        alert('API cart update pending implementation');
    } else {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const idx = cart.findIndex(i => i.productId === id);
        if (idx > -1) {
            cart[idx].quantity += delta;
            if (cart[idx].quantity < 1) cart[idx].quantity = 1;
            localStorage.setItem('cart', JSON.stringify(cart));
            location.reload();
        }
    }
}

function removeCartItem(id, isAuth) {
    if (confirm('Remove this item?')) {
        if (isAuth) {
             alert('API cart remove pending implementation');
        } else {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            cart = cart.filter(i => i.productId !== id);
            localStorage.setItem('cart', JSON.stringify(cart));
            location.reload();
        }
    }
}
