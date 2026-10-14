package com.webcommerce.shop;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TiendaIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void deberiaCargarLaPaginaPrincipalOEndpoint() throws Exception {
        // Simulamos una petición a la ruta principal o de productos
        mockMvc.perform(get("/"))
               .andExpect(status().isOk());
    }
}