import { App, Notice, TFile } from "obsidian";

/**
 * NewPages gestiona la creación dinámica de páginas en Obsidian
 * basándose en el contenido de archivos con líneas marcadas.
 *
 * @class NewPages
 */
export default class NewPages {
	// Referencia a la instancia principal de Obsidian
	private app: App;

	/**
	 * Constructor que inicializa la instancia con la aplicación de Obsidian
	 *
	 * @param {App} app - Instancia principal de la aplicación Obsidian
	 */
	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Extrae líneas que comienzan con asterisco para procesamiento posterior
	 *
	 * @param {string} texto - Texto original a filtrar
	 * @returns {string[]} Líneas que comienzan con asterisco
	 */
	private filtrarTexto(texto: string) {
		return texto
			.split("\n")
			.filter((linea) => linea.trim().startsWith("*"));
	}

	/**
	 * Crea archivos individuales para cada línea con asterisco
	 *
	 * @param {string} titulo - Título base para nombrar las páginas
	 * @param {string[]} lineasEspeciales - Líneas que comienzan con asterisco
	 * @returns {Promise<string[] | undefined>} Lista de nombres de archivos creados
	 */
	private async crearPaginasIndividuales(
		titulo: string,
		lineasEspeciales: string[]
	) {
		try {
			const paginasCreadas: string[] = [];

			lineasEspeciales.forEach((linea, i) => {
				const contenidoPagina = linea.replace("*", "").trim();
				const nombreArchivo = `${i + 1}.${titulo}.md`;
				const rutaCompleta = `${titulo}_paginas/${nombreArchivo}`;

				this.app.vault.create(rutaCompleta, contenidoPagina);
				paginasCreadas.push(nombreArchivo);
			});

			return paginasCreadas;
		} catch (error) {
			console.error("Error al crear las páginas:", error);
		}
	}

	/**
	 * Reemplaza líneas con asterisco por enlaces wiki numerados
	 *
	 * @param {string} texto - Texto original a modificar
	 * @param {string} titulo - Título base para generar los enlaces
	 * @returns {string} Texto modificado con enlaces wiki
	 */
	private remplazarTexto(texto: string, titulo: string) {
		let index = 0;
		const textArray = texto.split("\n");

		return textArray
			.map((linea) => {
				linea = linea.trim();

				if (linea.startsWith("*")) {
					index++;
					return `[[${titulo}_paginas/${index}.${titulo}.md]]`;
				}
				return linea;
			})
			.join("\n");
	}

	/**
	 * Obtiene el archivo actualmente abierto en Obsidian
	 *
	 * @returns {TFile | null} Archivo activo o null si no hay ninguno
	 */
	private obtenerArchivoActivo() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No hay archivo activo");
			return null;
		}
		return activeFile;
	}

	/**
	 * Lee el contenido del archivo activo y prepara su procesamiento
	 *
	 * @param {TFile} activeFile - Archivo activo a procesar
	 * @returns {Promise<{texto: string, titulo: string}>} Contenido y título del archivo
	 */
	private async procesarArchivoActivo(activeFile: TFile) {
		const texto = await this.app.vault.read(activeFile);
		const titulo = activeFile.basename;

		await this.app.vault.createFolder(`${titulo}_paginas`);

		return { texto, titulo };
	}

	/**
	 * Coordina la creación de páginas a partir del texto del archivo
	 *
	 * @param {string} texto - Texto original del archivo
	 * @param {string} titulo - Título base para las páginas
	 * @returns {Promise<string[] | undefined>} Páginas creadas
	 */
	private async crearPaginasDesdeTexto(texto: string, titulo: string) {
		const lineasEspeciales = this.filtrarTexto(texto);
		const paginasCreadas = await this.crearPaginasIndividuales(
			titulo,
			lineasEspeciales
		);

		if (!paginasCreadas) {
			new Notice("Error al crear las páginas");
			return undefined;
		}

		return paginasCreadas;
	}

	/**
	 * Método principal que orquesta todo el proceso de creación de páginas
	 * Extrae líneas con asterisco, crea páginas individuales y actualiza el archivo original
	 *
	 * @returns {Promise<void>}
	 */
	async newPages() {
		try {
			const activeFile = this.obtenerArchivoActivo();
			if (!activeFile) return;

			const { texto, titulo } = await this.procesarArchivoActivo(
				activeFile
			);

			const paginasCreadas = await this.crearPaginasDesdeTexto(
				texto,
				titulo
			);

			const textoModificado = this.remplazarTexto(texto, titulo);

			if (paginasCreadas) {
				await this.app.vault.modify(activeFile, textoModificado);

				new Notice(textoModificado);

				new Notice(
					`Creadas ${paginasCreadas.length} páginas en la carpeta "${titulo}_paginas"`
				);
			}
		} catch (error) {
			console.error("Error al crear páginas:", error);
			new Notice(`Error al crear páginas: ${error}`);
		}
	}
}
