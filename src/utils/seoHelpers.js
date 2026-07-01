export const getPropertyUrl = (property) => {
  if (!property) return '/';
  
  const idOrSlug = property.slug || property._id;
  const city = property.city ? property.city.toLowerCase().replace(/\s+/g, '-') : '';
  const type = property.propertyType || property.type || 'PG';
  
  if (!city) {
    return `/property/${idOrSlug}`;
  }

  if (type === 'PG') {
    return `/pg/${city}/${idOrSlug}`;
  } else if (type === 'Hostel') {
    return `/hostels/${city}/${idOrSlug}`;
  }
  
  return `/property/${city}/${idOrSlug}`;
};
