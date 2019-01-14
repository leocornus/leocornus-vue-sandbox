<template>
  <footer class="footer">
    <div class="container-fluid">
      <nav>
        <ul class="footer-menu">
          <li>
            <router-link :to="{path:'/admin'}">{{this.$localSettings.footerTitle}}</router-link>
          </li>
        </ul>
      </nav>
      <div class="copyright text-center">
        &copy; 2019
        <a href="https://www.leocorn.com" target="_blank">Leocornus LTD.</a>.
      </div>
    </div>
  </footer>
</template>
<script>
export default {
}
</script>
<style>

</style>
