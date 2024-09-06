insert into pizza_size (size, num_included_toppings, price, price_per_additional_topping)
values
  ('Small', 2, 6.99, 1.49),
  ('Medium', 3, 8.99, 1.49),
  ('Large', 4, 11.99, 1.49);

insert into topping (name)
values
  ('Pepperoni'),
  ('Sausage'),
  ('Mushrooms'),
  ('Pineapple'),
  ('Extra cheese'),
  ('Jalapenos'),
  ('Peppers'),
  ('Ham'),
  ('Chicken'),
  ('Bacon');

insert into order_status (id, name)
values
  (1, 'Order Received'),
  (2, 'Making Pizza'),
  (3, 'Out for Delivery'),
  (4, 'Delivered'),
  (5, 'Cancelled');
