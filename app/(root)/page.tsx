import ProductList from "@/components/shared/product/product-list";
// import sampleData from "@/db/sample-data";
import { getLatestProducts } from "@/lib/actions/product.actions";

export const metadata = {
  title: "Home",
  description: "Home page of the Prostore",
}

const Home = async () => {
  const latestProducts = await getLatestProducts();

  return ( 
    <>
      <ProductList data={latestProducts} title="Newest Arrivals"></ProductList>
    </>
  );
}

export default Home;