<template>
  <NuxtLink to="/owner" class="owner-btn">
    <Icon name="material-symbols:key-rounded" class="owner-icon" />
  </NuxtLink>
</template>

<style scoped>
.owner-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  text-decoration: none;
  
  /* KEMBALIKAN KE KUNING */
  background: #FFD700; 
  color: #000000; /* Hitam agar ikon kuncinya jelas terlihat di background kuning */
  
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
}

.owner-btn:hover {
  transform: scale(1.05);
  /* Bisa dikasih efek kuning lebih terang saat hover */
  background: #ffe44d; 
}

.owner-icon {
  font-size: 18px;
}
</style>