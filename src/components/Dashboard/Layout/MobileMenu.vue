<template>
  <ul class="nav nav-mobile-menu">
    <li class="nav-item">
      <a href="#" class="nav-link">
        <i class="nc-icon nc-zoom-split hidden-lg-up"></i>
        <span class="d-lg-none">Search</span>
      </a>
    </li>

    <li class="nav-item">
      <a class="nav-link" href="#pablo">
        <span class="no-icon">About</span>
      </a>
    </li>
  </ul>
</template>
<script>
  import DropDown from '@/components/UIComponents/Dropdown.vue'

  export default {
    components: {
      DropDown
    }
  }
</script>
<style>
</style>
