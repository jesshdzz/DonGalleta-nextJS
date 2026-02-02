-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: mysql
-- Tiempo de generación: 18-02-2025 a las 21:24:42
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `DonGalleta`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`%` PROCEDURE `EliminarProducto` (IN `prod_id` INT)   BEGIN
    DECLARE existe_producto INT;
    DECLARE en_pedido INT;
    
    -- Verificar si el producto existe
    SELECT COUNT(*) INTO existe_producto FROM Productos WHERE id = prod_id;
    IF existe_producto = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: El producto no existe.';
    END IF;
    
    -- Verificar si el producto está en un pedido
    SELECT COUNT(*) INTO en_pedido FROM Detalles_pedido WHERE id_producto = prod_id;
    
    -- Si el producto está en un pedido, en lugar de eliminarlo, se desactiva
    IF en_pedido > 0 THEN
        UPDATE Productos SET disponibilidad = 0 WHERE id = prod_id;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El producto está en pedidos, por lo que fue desactivado en lugar de eliminarse.';
    ELSE
        -- Eliminar relaciones en Producto_sabor
        DELETE FROM Producto_sabor WHERE id_producto = prod_id;

        -- Eliminar del carrito
        DELETE FROM Carrito WHERE id_producto = prod_id;

        -- Eliminar el producto
        DELETE FROM Productos WHERE id = prod_id;
    END IF;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `InsertarDetallePedido` (IN `id_pedido` INT, IN `id_producto` INT, IN `cantidad` INT)   BEGIN
    DECLARE precio DECIMAL(10,2);
    
    -- Obtener precio del producto
    SELECT precio INTO precio FROM Productos WHERE id = id_producto;

    -- Insertar detalle con precio calculado
    INSERT INTO Detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
    VALUES (id_pedido, id_producto, cantidad, precio, cantidad * precio);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Carrito`
--

CREATE TABLE `Carrito` (
  `id` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `fecha_agregado` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_pedido` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `Detalles_Compra`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `Detalles_Compra` (
`cantidad` int
,`id_pedido` int
,`id_usuario` int
,`precio_unitario` decimal(10,2)
,`producto` varchar(100)
,`subtotal` decimal(10,2)
,`usuario` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Detalles_pedido`
--

CREATE TABLE `Detalles_pedido` (
  `id` int NOT NULL,
  `id_pedido` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `Detalles_pedido`
--

INSERT INTO `Detalles_pedido` (`id`, `id_pedido`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 1, 5, 17.00, 85.00),
(2, 1, 4, 2, 23.00, 46.00),
(3, 1, 4, 3, 23.00, 69.00),
(4, 2, 5, 4, 13.53, 54.12),
(13, 2, 5, 5, 13.53, 67.65),
(33, 23, 1, 5, 17.00, 85.00),
(34, 23, 2, 5, 17.00, 85.00),
(35, 23, 4, 10, 23.00, 230.00),
(36, 23, 5, 2, 13.53, 27.06),
(37, 24, 1, 2, 17.00, 34.00),
(38, 24, 2, 1, 17.00, 17.00),
(39, 24, 4, 1, 23.00, 23.00),
(40, 24, 5, 1, 13.53, 13.53),
(41, 25, 1, 5, 17.00, 85.00),
(42, 26, 1, 5, 17.00, 85.00),
(43, 26, 2, 15, 17.00, 255.00),
(44, 26, 4, 2, 23.00, 46.00),
(45, 26, 5, 7, 13.53, 94.71),
(46, 27, 5, 3, 13.53, 40.59),
(47, 28, 5, 1, 13.53, 13.53),
(48, 28, 11, 2, 19.50, 39.00),
(49, 29, 11, 100, 19.50, 1950.00),
(50, 29, 13, 70, 12.70, 889.00),
(51, 29, 14, 10, 15.00, 150.00),
(52, 30, 13, 30, 12.70, 381.00),
(53, 31, 11, 3, 19.50, 58.50),
(54, 32, 1, 1, 17.00, 17.00),
(55, 32, 2, 1, 17.00, 17.00),
(56, 32, 5, 1, 13.53, 13.53),
(57, 32, 11, 1, 19.50, 19.50),
(58, 32, 15, 1, 11.00, 11.00),
(59, 33, 1, 1, 17.00, 17.00),
(60, 33, 5, 2, 13.53, 27.06);

--
-- Disparadores `Detalles_pedido`
--
DELIMITER $$
CREATE TRIGGER `actualizar_stock_al_comprar` AFTER INSERT ON `Detalles_pedido` FOR EACH ROW BEGIN
    UPDATE Productos
    SET stock = stock - NEW.cantidad
    WHERE id = NEW.id_producto;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `actualizar_total_pedido_delete` AFTER DELETE ON `Detalles_pedido` FOR EACH ROW BEGIN
    UPDATE Pedidos
    SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM Detalles_pedido WHERE id_pedido = OLD.id_pedido)
    WHERE id = OLD.id_pedido;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `actualizar_total_pedido_update` AFTER UPDATE ON `Detalles_pedido` FOR EACH ROW BEGIN
    UPDATE Pedidos
    SET total = (SELECT SUM(subtotal) FROM Detalles_pedido WHERE id_pedido = NEW.id_pedido)
    WHERE id = NEW.id_pedido;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `calcular_subtotal` BEFORE INSERT ON `Detalles_pedido` FOR EACH ROW BEGIN
    DECLARE precio_nuevo DECIMAL(10,2);

    SELECT precio INTO precio_nuevo FROM Productos WHERE id = NEW.id_producto;
    
	SET NEW.precio_unitario = precio_nuevo;
    SET NEW.subtotal = NEW.cantidad * NEW.precio_unitario;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Historial_estados_pedido`
--

CREATE TABLE `Historial_estados_pedido` (
  `id` int NOT NULL,
  `id_pedido` int NOT NULL,
  `estado` enum('pendiente','procesando','completado','cancelado') NOT NULL,
  `fecha_cambio` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Pagos`
--

CREATE TABLE `Pagos` (
  `id` int NOT NULL,
  `id_pedido` int NOT NULL,
  `metodo_pago` enum('paypal','transferencia','tarjeta') NOT NULL,
  `referencia` varchar(100) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_sucursal` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `Pagos`
--

INSERT INTO `Pagos` (`id`, `id_pedido`, `metodo_pago`, `referencia`, `monto`, `fecha_pago`, `id_sucursal`) VALUES
(1, 23, 'paypal', '85K43996J2354305K', 427.06, '2025-02-09 20:42:18', 1),
(2, 24, 'paypal', '2L562543FF0086040', 87.53, '2025-02-09 20:45:18', 1),
(3, 25, 'paypal', '5KH04126917395213', 85.00, '2025-02-09 21:15:33', 1),
(4, 26, 'paypal', '97M3623770656560D', 480.71, '2025-02-11 06:34:01', 1),
(5, 27, 'paypal', '16F84988XT654764B', 40.59, '2025-02-11 16:30:43', 1),
(6, 28, 'paypal', '17K16859F48934810', 52.53, '2025-02-11 16:31:36', 2),
(7, 29, 'paypal', '5EN53393VR925422C', 2989.00, '2025-02-11 16:59:15', 2),
(8, 30, 'paypal', '8LR136422C096253H', 381.00, '2025-02-11 17:06:10', 1),
(9, 31, 'paypal', '8GJ48663F7274244H', 58.50, '2025-02-11 17:35:21', 2),
(10, 32, 'paypal', '5DG5148593896151X', 78.03, '2025-02-13 23:54:25', 1),
(11, 33, 'paypal', '3P799496PA846433R', 44.06, '2025-02-18 21:19:40', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Pedidos`
--

CREATE TABLE `Pedidos` (
  `id` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_sucursal` int NOT NULL,
  `fecha_pedido` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','procesando','completado','cancelado') NOT NULL,
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `Pedidos`
--

INSERT INTO `Pedidos` (`id`, `id_usuario`, `id_sucursal`, `fecha_pedido`, `estado`, `total`) VALUES
(1, 1, 1, '2025-02-08 02:14:12', 'procesando', 200.00),
(2, 1, 1, '2025-02-08 02:14:12', 'pendiente', 54.12),
(22, 2, 1, '2025-02-09 14:18:23', 'pendiente', 127.50),
(23, 2, 2, '2025-02-09 20:42:18', 'pendiente', 427.06),
(24, 1, 2, '2025-02-09 20:45:18', 'pendiente', 87.53),
(25, 2, 1, '2025-02-09 21:15:33', 'completado', 85.00),
(26, 2, 1, '2025-02-11 06:34:01', 'completado', 480.71),
(27, 2, 1, '2025-02-11 16:30:43', 'completado', 40.59),
(28, 2, 2, '2025-02-11 16:31:36', 'completado', 52.53),
(29, 2, 2, '2025-02-11 16:59:15', 'completado', 2989.00),
(30, 1, 1, '2025-02-11 17:06:10', 'completado', 381.00),
(31, 2, 2, '2025-02-11 17:35:21', 'completado', 58.50),
(32, 2, 1, '2025-02-13 23:54:25', 'completado', 78.03),
(33, 2, 1, '2025-02-18 21:19:40', 'completado', 44.06);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `Pedidos_Usuarios`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `Pedidos_Usuarios` (
`cliente` varchar(100)
,`estado` enum('pendiente','procesando','completado','cancelado')
,`fecha_pedido` timestamp
,`id_pedido` int
,`id_usuario` int
,`total` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Productos`
--

CREATE TABLE `Productos` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `disponibilidad` tinyint(1) DEFAULT '1',
  `stock` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `Productos`
--

INSERT INTO `Productos` (`id`, `nombre`, `descripcion`, `precio`, `imagen`, `disponibilidad`, `stock`) VALUES
(1, 'new york', 'Galleta estilo New york', 17.00, NULL, 1, 98),
(2, 'new york', 'Galleta estilo New york', 17.00, NULL, 1, 78),
(4, 'Galleta Chocoavellana', '', 23.00, NULL, 1, 0),
(5, 'chokis', 'Galleta sabor vainilla con chispas de chocolate', 13.53, NULL, 1, 68),
(11, 'Emperador', 'Galleta estilo emperador con relleno de fresa', 19.50, NULL, 1, 46),
(13, 'chokis', 'galleta', 12.70, NULL, 1, 0),
(14, 'arcoiris', 'hola', 15.00, NULL, 1, 0),
(15, 'lords', 'delicosas', 11.00, NULL, 1, 14),
(16, 'HOLA', 'GALLETA', 12.50, NULL, 1, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Producto_sabor`
--

CREATE TABLE `Producto_sabor` (
  `id_producto` int NOT NULL,
  `id_sabor` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `Producto_sabor`
--

INSERT INTO `Producto_sabor` (`id_producto`, `id_sabor`) VALUES
(1, 1),
(2, 1),
(4, 1),
(5, 1),
(15, 1),
(11, 2),
(15, 2),
(4, 3),
(14, 3),
(1, 5),
(5, 5),
(2, 6),
(13, 6),
(16, 6),
(16, 9),
(14, 16);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Sabores`
--

CREATE TABLE `Sabores` (
  `id` int NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `Sabores`
--

INSERT INTO `Sabores` (`id`, `nombre`) VALUES
(15, 'arandano'),
(3, 'avellana'),
(16, 'bombon'),
(11, 'cacao'),
(1, 'chocolate'),
(2, 'fresa'),
(8, 'manzana'),
(6, 'menta'),
(9, 'nuez'),
(5, 'vainilla');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Sucursales`
--

CREATE TABLE `Sucursales` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` text NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `Sucursales`
--

INSERT INTO `Sucursales` (`id`, `nombre`, `direccion`, `latitud`, `longitud`, `telefono`) VALUES
(1, 'Universidad UTM', 'Av. Doctor Modesto Seara Vázquez #1, Acatlima, 69000 Heroica Cdad. de Huajuapan de León, Oax.', 17.82644632, -97.80314926, NULL),
(2, 'Parque Independencia', 'Prol. de Valerio Trujano 1, Centro, 69000 Heroica Cdad. de Huajuapan de León, Oax.', 17.80626158, -97.77579945, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Tickets`
--

CREATE TABLE `Tickets` (
  `id` int NOT NULL,
  `id_pedido` int NOT NULL,
  `id_sucursal` int NOT NULL,
  `codigo_ticket` varchar(20) NOT NULL,
  `fecha_generacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `Tickets`
--

INSERT INTO `Tickets` (`id`, `id_pedido`, `id_sucursal`, `codigo_ticket`, `fecha_generacion`) VALUES
(1, 25, 1, 'TCK-67AAEEC3387B6', '2025-02-11 06:31:31'),
(2, 26, 1, 'TCK-67AAEF5BE34A6', '2025-02-11 06:34:03'),
(3, 26, 1, 'TCK-67AAFEB024483', '2025-02-11 07:39:28'),
(4, 26, 1, 'TCK-67AAFFE6525A1', '2025-02-11 07:44:38'),
(5, 27, 1, 'TCK-67AB7B35A8F3F', '2025-02-11 16:30:45'),
(6, 28, 1, 'TCK-67AB7B6A88F37', '2025-02-11 16:31:38'),
(7, 29, 1, 'TCK-67AB81E710FB4', '2025-02-11 16:59:19'),
(8, 30, 1, 'TCK-67AB83855D16E', '2025-02-11 17:06:13'),
(9, 31, 1, 'TCK-67AB8A5C9735A', '2025-02-11 17:35:24'),
(10, 32, 1, 'TCK-67AE8634DD11F', '2025-02-13 23:54:28'),
(11, 33, 1, 'TCK-67B4F97085E6B', '2025-02-18 21:19:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Usuarios`
--

CREATE TABLE `Usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('cliente','administrador') NOT NULL,
  `status` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `Usuarios`
--

INSERT INTO `Usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `status`, `fecha_registro`) VALUES
(1, 'Jesus Hernandez', 'chuchohernandez3221@gmail.com', '$2y$10$mNl.ccUZ0bLCk1PaPhHa9.sbXbqPFp7PbQ3I6MN0Y5cPolCZ19w7G', 'cliente', 'activo', '2025-02-03 02:25:48'),
(2, 'Adminstrador', 'admin@dongalleta.com', '$2y$10$YBgURXV5KWixPFmewYw3juOEH4y505bnuZmFgYud3FywibL8kAxLq', 'administrador', 'activo', '2025-02-03 02:41:03');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `Vista_Carrito_Usuario`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `Vista_Carrito_Usuario` (
`cantidad` int
,`id_producto` int
,`id_usuario` int
,`imagen` varchar(255)
,`nombre_producto` varchar(100)
,`precio_unitario` decimal(10,2)
,`sabores` text
,`subtotal` decimal(20,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `Vista_Pedidos_Detallada`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `Vista_Pedidos_Detallada` (
`direccion_sucursal` text
,`estado` enum('pendiente','procesando','completado','cancelado')
,`fecha_pedido` timestamp
,`id_pedido` int
,`id_usuario` int
,`nombre_sucursal` varchar(100)
,`nombre_usuario` varchar(100)
,`total` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `Vista_Productos_Catalogo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `Vista_Productos_Catalogo` (
`descripcion` text
,`disponibilidad` tinyint(1)
,`id_producto` int
,`imagen` varchar(255)
,`nombre_producto` varchar(100)
,`precio` decimal(10,2)
,`sabores` text
,`stock` int
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `Vista_Total_Carrito`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `Vista_Total_Carrito` (
`id_usuario` int
,`total` decimal(42,2)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `Detalles_Compra`
--
DROP TABLE IF EXISTS `Detalles_Compra`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `Detalles_Compra`  AS SELECT `dp`.`id_pedido` AS `id_pedido`, `u`.`id` AS `id_usuario`, `u`.`nombre` AS `usuario`, `p`.`nombre` AS `producto`, `dp`.`cantidad` AS `cantidad`, `dp`.`precio_unitario` AS `precio_unitario`, `dp`.`subtotal` AS `subtotal` FROM (((`Detalles_pedido` `dp` join `Pedidos` `ped` on((`dp`.`id_pedido` = `ped`.`id`))) join `Usuarios` `u` on((`ped`.`id_usuario` = `u`.`id`))) join `Productos` `p` on((`dp`.`id_producto` = `p`.`id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `Pedidos_Usuarios`
--
DROP TABLE IF EXISTS `Pedidos_Usuarios`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `Pedidos_Usuarios`  AS SELECT `p`.`id` AS `id_pedido`, `u`.`id` AS `id_usuario`, `u`.`nombre` AS `cliente`, `p`.`fecha_pedido` AS `fecha_pedido`, `p`.`estado` AS `estado`, `p`.`total` AS `total` FROM (`Pedidos` `p` join `Usuarios` `u` on((`p`.`id_usuario` = `u`.`id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `Vista_Carrito_Usuario`
--
DROP TABLE IF EXISTS `Vista_Carrito_Usuario`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `Vista_Carrito_Usuario`  AS SELECT `c`.`id_usuario` AS `id_usuario`, `c`.`id_producto` AS `id_producto`, `p`.`nombre` AS `nombre_producto`, group_concat(`s`.`nombre` order by `s`.`nombre` ASC separator ', ') AS `sabores`, `c`.`cantidad` AS `cantidad`, `p`.`precio` AS `precio_unitario`, (`c`.`cantidad` * `p`.`precio`) AS `subtotal`, `p`.`imagen` AS `imagen` FROM (((`Carrito` `c` join `Productos` `p` on((`c`.`id_producto` = `p`.`id`))) left join `Producto_sabor` `ps` on((`p`.`id` = `ps`.`id_producto`))) left join `Sabores` `s` on((`ps`.`id_sabor` = `s`.`id`))) GROUP BY `c`.`id_usuario`, `c`.`id_producto`, `p`.`nombre`, `p`.`precio`, `p`.`imagen`, `c`.`cantidad` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `Vista_Pedidos_Detallada`
--
DROP TABLE IF EXISTS `Vista_Pedidos_Detallada`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `Vista_Pedidos_Detallada`  AS SELECT `p`.`id` AS `id_pedido`, `u`.`id` AS `id_usuario`, `u`.`nombre` AS `nombre_usuario`, `s`.`nombre` AS `nombre_sucursal`, `s`.`direccion` AS `direccion_sucursal`, `p`.`fecha_pedido` AS `fecha_pedido`, `p`.`estado` AS `estado`, `p`.`total` AS `total` FROM ((`Pedidos` `p` join `Usuarios` `u` on((`p`.`id_usuario` = `u`.`id`))) left join `Sucursales` `s` on((`p`.`id_sucursal` = `s`.`id`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `Vista_Productos_Catalogo`
--
DROP TABLE IF EXISTS `Vista_Productos_Catalogo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `Vista_Productos_Catalogo`  AS SELECT `p`.`id` AS `id_producto`, `p`.`nombre` AS `nombre_producto`, group_concat(`s`.`nombre` order by `s`.`nombre` ASC separator ', ') AS `sabores`, `p`.`descripcion` AS `descripcion`, `p`.`precio` AS `precio`, `p`.`stock` AS `stock`, `p`.`imagen` AS `imagen`, `p`.`disponibilidad` AS `disponibilidad` FROM ((`Productos` `p` left join `Producto_sabor` `ps` on((`p`.`id` = `ps`.`id_producto`))) left join `Sabores` `s` on((`ps`.`id_sabor` = `s`.`id`))) GROUP BY `p`.`id`, `p`.`nombre`, `p`.`descripcion`, `p`.`precio`, `p`.`stock`, `p`.`imagen`, `p`.`disponibilidad` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `Vista_Total_Carrito`
--
DROP TABLE IF EXISTS `Vista_Total_Carrito`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `Vista_Total_Carrito`  AS SELECT `c`.`id_usuario` AS `id_usuario`, sum((`c`.`cantidad` * `p`.`precio`)) AS `total` FROM (`Carrito` `c` join `Productos` `p` on((`c`.`id_producto` = `p`.`id`))) GROUP BY `c`.`id_usuario` ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Carrito`
--
ALTER TABLE `Carrito`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`,`id_producto`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `fk_carrito_pedido` (`id_pedido`);

--
-- Indices de la tabla `Detalles_pedido`
--
ALTER TABLE `Detalles_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `Historial_estados_pedido`
--
ALTER TABLE `Historial_estados_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_pedido` (`id_pedido`);

--
-- Indices de la tabla `Pagos`
--
ALTER TABLE `Pagos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `referencia` (`referencia`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `Sucursales_ibfk_1` (`id_sucursal`);

--
-- Indices de la tabla `Pedidos`
--
ALTER TABLE `Pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `Sucur_ibfk_1` (`id_sucursal`);

--
-- Indices de la tabla `Productos`
--
ALTER TABLE `Productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Producto_sabor`
--
ALTER TABLE `Producto_sabor`
  ADD PRIMARY KEY (`id_producto`,`id_sabor`),
  ADD KEY `id_sabor` (`id_sabor`);

--
-- Indices de la tabla `Sabores`
--
ALTER TABLE `Sabores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `Sucursales`
--
ALTER TABLE `Sucursales`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `Tickets`
--
ALTER TABLE `Tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_ticket` (`codigo_ticket`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_sucursal` (`id_sucursal`);

--
-- Indices de la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Carrito`
--
ALTER TABLE `Carrito`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `Detalles_pedido`
--
ALTER TABLE `Detalles_pedido`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT de la tabla `Historial_estados_pedido`
--
ALTER TABLE `Historial_estados_pedido`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Pagos`
--
ALTER TABLE `Pagos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `Pedidos`
--
ALTER TABLE `Pedidos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `Productos`
--
ALTER TABLE `Productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `Sabores`
--
ALTER TABLE `Sabores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `Sucursales`
--
ALTER TABLE `Sucursales`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `Tickets`
--
ALTER TABLE `Tickets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `Usuarios`
--
ALTER TABLE `Usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `Carrito`
--
ALTER TABLE `Carrito`
  ADD CONSTRAINT `Carrito_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Carrito_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `Productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_carrito_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `Pedidos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `Detalles_pedido`
--
ALTER TABLE `Detalles_pedido`
  ADD CONSTRAINT `Detalles_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `Pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Detalles_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `Productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `Historial_estados_pedido`
--
ALTER TABLE `Historial_estados_pedido`
  ADD CONSTRAINT `Historial_estados_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `Pedidos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `Pagos`
--
ALTER TABLE `Pagos`
  ADD CONSTRAINT `Pagos_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `Pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Sucursales_ibfk_1` FOREIGN KEY (`id_sucursal`) REFERENCES `Sucursales` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `Pedidos`
--
ALTER TABLE `Pedidos`
  ADD CONSTRAINT `Pedidos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Sucur_ibfk_1` FOREIGN KEY (`id_sucursal`) REFERENCES `Sucursales` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Filtros para la tabla `Producto_sabor`
--
ALTER TABLE `Producto_sabor`
  ADD CONSTRAINT `Producto_sabor_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `Productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Producto_sabor_ibfk_2` FOREIGN KEY (`id_sabor`) REFERENCES `Sabores` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `Tickets`
--
ALTER TABLE `Tickets`
  ADD CONSTRAINT `Tickets_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `Pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Tickets_ibfk_2` FOREIGN KEY (`id_sucursal`) REFERENCES `Sucursales` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;