// Ride products shown in the app. Fares come from the same price list used by the checkout function.
export const RIDE_TIERS = [
  { type: "UberX", desc: "Affordable rides, all to yourself", price: 12, eta: 5, vehicle: "Toyota Prius", seats: 4 },
  { type: "Comfort", desc: "Newer cars with extra legroom", price: 16.5, eta: 7, vehicle: "Honda Accord", seats: 4 },
  { type: "Black", desc: "Premium rides in luxury cars", price: 24, eta: 9, vehicle: "Mercedes E-Class", seats: 4 },
  { type: "XL", desc: "Affordable rides for groups up to 6", price: 19, eta: 6, vehicle: "Toyota Sienna", seats: 6 },
];