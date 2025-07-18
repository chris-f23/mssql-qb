# MSSQL Query Builder

Este proyecto busca facilitar la construcción de consultas para la base de datos Microsoft SQL Server.

## 📋 Hoja de ruta

### 🔍 SELECT

- [x] Debe poder indicar los valores o columnas.

  - Ej. `SELECT a, b, c`

- [x] Debe poder indicar la tabla principal

  - Ej. `SELECT a, b, c FROM table1 t1`

- [x] Debe poder indicar una o más tablas secundarias con las que puede hacer JOIN

  - Ej. `SELECT a, b, c FROM table1 t1 JOIN table2 t2 ON t1.id = t2.id`

- [x] Debe poder indicar las condiciones de búsqueda

  - Ej. `SELECT a, b, c FROM table1 t1 WHERE t1.id = 1 AND t1.name = 'John'`

- [x] Debe poder indicar la cantidad o porcentaje de registros a seleccionar

  - Ej. `SELECT TOP (n) a, b, c`
  - Ej. `SELECT TOP (p) PERCENT a, b, c`

- [x] Debe poder asignar un alias a un valor o columna

  - Ej. `SELECT a AS a_alias, b AS b_alias, c AS c_alias`

- [ ] Debe poder ordenar los registros por una o varias columnas

  - Ej. `SELECT a, b, c FROM table1 t1 ORDER BY t1.id DESC`

- [ ] Debe poder agrupar los registros por una o varias columnas
  - Ej. `SELECT a, b, c FROM table1 t1 GROUP BY t1.id`

### ✨ INSERT

- [x] Debe poder indicar la tabla objetivo
  - Ej. `INSERT INTO table1`
- [ ] Debe poder indicar las columnas a insertar
  - Ej. `INSERT INTO table1 (a, b, c)`
- [ ] Debe poder indicar el registro a insertar
  - Ej. `INSERT INTO table1 (a, b, c) VALUES (1, 'John', 'Doe')`
- [ ] Debe permitir insertar registros sin especificar las columnas
  - Ej. `INSERT INTO table1 VALUES (1, 'John', 'Doe')`
- [ ] Debe permitir insertar registros indicando columnas en cualquier orden
  - Ej. `INSERT INTO table1 (c, a, b) VALUES ('Doe', 1, 'John')`
- [ ] Debe permitir insertar multiples registros
  - Ej. `INSERT INTO table1 VALUES (1, 'John', 'Doe'), (2, 'Jane', 'Doe')`

### ✏️ UPDATE

- [ ] Debe poder indicar la tabla objetivo
  - Ej. `UPDATE table1`
- [ ] Debe poder indicar las columnas a actualizar
  - Ej. `UPDATE table1 SET a = 1, b = 'John', c = 'Doe'`
- [ ] Debe poder indicar las condiciones de búsqueda
  - Ej. `UPDATE table1 SET a = 1, b = 'John', c = 'Doe' WHERE id = 1`

### 🗑️ DELETE

- [ ] Debe poder indicar la tabla objetivo
  - Ej. `DELETE FROM table1`
- [ ] Debe poder indicar las condiciones de búsqueda
  - Ej. `DELETE FROM table1 WHERE id = 1`

## Modelo

- `TableDefinition`: Representa la definición de una tabla en la base de datos. Tiene el mínimo de datos necesarios para identificar la tabla en un servidor, como las columnas con las cuales se puede interactuar.

- `Ref`: Representa una referencia cualquiera. Es la clase base para cualquier referencia que pueda ser usada en una consulta.

  - Provee unicamente la función `build` que devuelve el valor de la referencia.

- `ValueRef`: Representa una referencia a un valor que puede ser comparado con otro.

  - Provee funciones de comparación como `isEqualTo`, `isLike`, etc.
  - Provee la función `as` para asignar un alias a la referencia.
  - Hereda de `Ref`.

- `ColumnRef`: Representa una referencia a una columna de una tabla.

  - Hereda de `ValueRef`.

- `LiteralRef`: Representa una referencia a un valor literal.

  - El valor de la referencia puede ser de tipo `string`, `number`, `boolean` o `null`.
  - La referencia construida será diferente dependiendo del tipo de dato del valor literal.
  - Hereda de `ValueRef`.

- `Fn`: Clase que sirve de atajo para acceder a las funciones de SQL Server. El resultado de cualquiera de sus funciones serán referencias. Por ejemplo:
  - Para utilizar la función de SQL Server `CONCAT(valor_1, valor_2, ..., valor_n)` se puede ejecutar la función `Fn.CONCAT(referencia_1, referencia_2, ..., referencia_n)`

## 🚧 TODO

- Implementar agrupamiento de condiciones de búsqueda, de momento esto aplica para las clausulas `WHERE` y `ON`

- Otorgar una forma de definir funciones de SQL Server para evitar limitar la librería a solo las funciones definidas en la clase `Fn`.

- Mejorar la forma de digitar los valores a insertar en la instrucción `insert`. La forma actual de entregar parámetros usando la clase LiteralRef no es muy intuitiva.
