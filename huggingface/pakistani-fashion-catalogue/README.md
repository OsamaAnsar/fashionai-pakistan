---
pretty_name: Pakistani Fashion Catalogue
language:
- en
license: other
task_categories:
- tabular-classification
tags:
- fashion
- pakistan
- ecommerce
- virtual-try-on
size_categories:
- n<1K
---

# Pakistani Fashion Catalogue

A small, transparent catalogue of Pakistani ready-to-wear products assembled for the open-source [DrapePK](https://github.com/OsamaAnsar/fashionai-pakistan) fashion discovery and virtual try-on demo.

## Dataset contents

The initial release contains 75 product records from five Pakistani fashion retailers: Breakout, Charcoal, Cougar, Engine, and Outfitters. Each row includes the brand, product name, category, gender, price in PKR, available colours and sizes, plus links to the source product and its publicly served image.

Images are not redistributed. `image_url` and `product_url` remain external references owned and operated by their respective retailers and may change or expire.

## Intended uses

- Fashion search and recommendation prototypes
- Catalogue normalization experiments
- Pakistani retail trend analysis
- Virtual try-on interface research

This dataset is not suitable for sizing guarantees, price monitoring without revalidation, biometric analysis, or training systems that infer sensitive personal attributes.

## Collection and limitations

Records were collected from publicly accessible product pages for a portfolio demonstration. Prices, stock, colours, sizes, URLs, and product descriptions are snapshots and can become outdated. Brand representation is intentionally small and is not representative of Pakistan's complete fashion market.

## Licensing and attribution

The dataset's original normalization and documentation are provided for research and demonstration. Retailer names, product information, linked images, and linked page content remain subject to their respective owners' rights and terms. Users are responsible for reviewing source-site terms before redistribution or commercial use.

Created by [Osama Ansar](https://github.com/OsamaAnsar) as part of DrapePK.
