import { App, Notice, TFile } from "obsidian";

import { TextoService } from "./text";
import { PaginasService } from "./PaginasService";

/**
 * NewPages gestiona la creación dinámica de páginas en Obsidian
 * basándose en el contenido de archivos con líneas marcadas.
 *
 * @class NewPages
 */
export default class NewPages {
	// Referencia a la instancia principal de Obsidian
	private app: App;
	private textService: TextoService;
	private paginasService: PaginasService;

	/**
	 * Constructor que inicializa la instancia con la aplicación de Obsidian
	 *
	 * @param {App} app - Instancia principal de la aplicación Obsidian
	 */
	constructor(app: App) {
		this.app = app;
		this.textService = new TextoService();
		this.paginasService = new PaginasService(app);
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
		const contenidoDePaginas = this.textService.filtrarTexto(texto);
		const paginasCreadas =
			await this.paginasService.crearPaginasIndividuales(
				titulo,
				contenidoDePaginas
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
	async ejecutarProceso() {
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

			if (paginasCreadas) {
				const textoModificado = this.textService.remplazarTexto(
					texto,
					paginasCreadas
				);

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
