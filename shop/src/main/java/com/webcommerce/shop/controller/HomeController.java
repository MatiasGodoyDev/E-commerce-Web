    package com.webcommerce.shop.controller;

    import com.webcommerce.shop.repository.ProductRepository; // Ajusta elimport según tu paquete
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Controller;
    import org.springframework.ui.Model;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.RequestParam;

    @Controller
    public class HomeController {

        @Autowired
        private ProductRepository productoRepository; 

        
        @GetMapping("/index.html")
        public String redireccionarIndex() {
            return "redirect:/";
        }

        @GetMapping({"/", "/index"})
        public String index(Model model) {
            return "index"; 
    }

        @GetMapping("/carrito")
        public String carrito() {
            return "carrito";
        }

        @GetMapping("/checkout")
        public String checkout() {
            return "checkout";
        }

    @GetMapping("/descripcion")
        public String descripcion(@RequestParam("id") Long id, Model model) {
            var producto = productoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            
            model.addAttribute("producto", producto);
            
            return "descripcion";
        }
        @GetMapping("/login")
        public String login() {
            return "login";
        }

    @GetMapping("/moda")
        public String moda(Model model) {
            model.addAttribute("productos", productoRepository.findByEsModaTrue());
            return "moda";
        }

        @GetMapping("/ofertas")
        public String ofertas(Model model) {
            model.addAttribute("productos", productoRepository.findByEsOfertaTrue());
            return "ofertas";
        }

        @GetMapping("/unico")
        public String unico(Model model) {
            model.addAttribute("productos", productoRepository.findByEsUnicoTrue());
            return "unico";
        }

        @GetMapping("/perfil")
        public String perfil() {
            return "perfil";
        }

        @GetMapping("/personalizado")
        public String personalizado() {
            return "personalizado";
        }

        @GetMapping("/wishlist")
        public String wishlist() {
            return "wishlist";
        }

        @GetMapping("/admin")
        public String admin() {
            return "admin";
        }
    }