import { App } from "obsidian";
import type { Pagina } from "./types";

interface propsCrearPagina {
	ruta: string;
	titulo: string;
	contenido: string;
	indice: number;
}

export class PaginasService {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Genera una ruta y carpeta para crear páginas en el mismo directorio del archivo activo
	 *
	 * @param {string} titulo - Título base para nombrar la carpeta
	 * @returns {Promise<string>} Ruta completa para la nueva carpeta de páginas
	 * @throws {Error} Si no hay archivo activo
	 */
	public async generarRutaPaginas(titulo: string): Promise<string> {
		// Obtener el archivo activo
		const activeFile = this.app.workspace.getActiveFile();

		if (!activeFile) {
			throw new Error("No hay archivo activo");
		}

		// Generar carpeta con título y número aleatorio
		const folder = `${titulo}_paginas(${
			Math.floor(Math.random() * 9000) + 1000
		})`;

		// Obtener el directorio del archivo actual
		const directorioBase = activeFile.path.replace(activeFile.name, "");

		// Crear carpeta
		await this.app.vault.createFolder(`${directorioBase}${folder}`);

		// Generar ruta con título y número aleatorio
		return `${directorioBase}${folder}`;
	}

	/**
	 * Crea un archivo individual para una página
	 *
	 * @param {string} ruta - Ruta base para crear el archivo
	 * @param {string} titulo - Título base para nombrar el archivo
	 * @param {string} contenido - Contenido de la página
	 * @param {number} indice - Índice para nombrar el archivo
	 * @returns {Pagina} Información de la página creada
	 */
	private crearPagina({ ruta, titulo, contenido, indice }: propsCrearPagina) {
		const contenidoLimpiado = contenido.trim();
		const nombreArchivo = `${indice + 1}.${titulo}.md`;
		const rutaCompleta = `${ruta}/${nombreArchivo}`;

		this.app.vault.create(rutaCompleta, contenidoLimpiado);

		return {
			nombre: rutaCompleta,
			contenido: contenido,
		};
	}

	/**
	 * Crea archivos individuales para cada línea con asterisco
	 *
	 * @param {string} titulo - Título base para nombrar las páginas
	 * @param {string[]} contenidoDePaginas - Líneas que comienzan con asterisco
	 * @returns {Promise<Pagina[] | undefined>} Lista de nombres de archivos creados
	 */
	public async crearPaginasIndividuales(
		titulo: string,
		contenidoDePaginas: string[]
	) {
		try {
			const ruta = await this.generarRutaPaginas(titulo);

			const paginasCreadas = contenidoDePaginas.map((contenido, i) =>
				this.crearPagina({
					ruta,
					titulo,
					contenido,
					indice: i,
				})
			);

			return paginasCreadas;
		} catch (error) {
			console.error("Error al crear páginas:", error);
			return undefined;
		}
	}
}
