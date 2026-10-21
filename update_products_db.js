const { run, all } = require('./server/db');

async function updateProductImages() {
  await run("UPDATE products SET card_image = '/uploads/produtos/card_produto_1_vida.jpg' WHERE slug = 'vida'");
  await run("UPDATE products SET card_image = '/uploads/produtos/card_produto_2_viagem.jpg' WHERE slug = 'viagem'");
  await run("UPDATE products SET card_image = '/uploads/produtos/card_produto_3_previdencia.jpg' WHERE slug = 'previdencia'");
  await run("UPDATE products SET card_image = '/uploads/produtos/card_produto_4_saude.jpg' WHERE slug = 'saude'");
  
  const prods = await all('SELECT id, slug, title, card_image FROM products');
  console.log('Updated products successfully:');
  console.log(prods);
  process.exit(0);
}

updateProductImages().catch(err => {
  console.error(err);
  process.exit(1);
});
