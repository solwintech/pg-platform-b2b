export const getPropertyUrl = (property) => {
  if (!property) return '/';
  
  const idOrSlug = property.slug || property._id;
  const city = property.city ? property.city.toLowerCase().replace(/\s+/g, '-') : '';
  const type = property.propertyType || property.type || 'PG';
  
  if (!city) {
    return `/property/${idOrSlug}`;
  }

  if (type === 'PG') {
    return `/pg-in-${city}/${idOrSlug}`;
  } else if (type === 'Hostel') {
    return `/hostels-in-${city}/${idOrSlug}`;
  }
  
  return `/property-in-${city}/${idOrSlug}`;
};
