function isCloudinaryDeliveryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url.trim());
    return (
      u.protocol === 'https:' &&
      u.hostname === 'res.cloudinary.com' &&
      u.pathname.includes('/image/upload/')
    );
  } catch {
    return false;
  }
}
function firstSegmentLooksLikeTransform(seg) {
  if (!seg) return false;
  if (seg.includes(',')) return true;
  return /^[fqcagd]_|^w_\d|^h_\d|^ar_/i.test(seg);
}
function withDeliveryTransforms(url, transformSegment) {
  if (!url || !transformSegment || !isCloudinaryDeliveryUrl(url)) return url;
  const i = url.indexOf('/upload/');
  if (i === -1) return url;
  const prefix = url.slice(0, i + '/upload/'.length);
  const rest = url.slice(i + '/upload/'.length);
  const first = rest.split('/')[0] || '';
  if (firstSegmentLooksLikeTransform(first)) return url;
  return prefix + transformSegment + "/" + rest;
}
console.log(withDeliveryTransforms('https://res.cloudinary.com/dxhvfs4he/image/upload/v1778747320/sabir-shah-ecom/products/p61_b0cp8q.jpg', 'f_auto,q_auto,w_480,c_limit'));
