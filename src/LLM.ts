import { App, Notice } from "obsidian";
import { ofetch } from "ofetch";

import type { TFile, Command } from "obsidian";

/**
 * Interfaz para representar datos de procesamiento de texto
 */
interface Data {
	texto_original: string;
	texto_procesado: string;
}

type TipoServicio = "separador" | "corrector";

/**
 * LLM (Language Learning Model) gestiona diversos servicios de procesamiento de texto
 * utilizando un servidor local con endpoints específicos
 *
 * @class LLM
 */
export default class LLM {
	// Referencia a la aplicación Obsidian
	private app: App;

	/**
	 * Constructor de la clase LLM
	 *
	 * @param {App} app - Instancia de la aplicación Obsidian
	 */
	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Método genérico para procesar contenido de archivo mediante un servicio específico
	 *
	 * @param {TipoServicio} servicio - Tipo de servicio a utilizar
	 * @returns {Promise<void>}
	 */
	async procesarContenido(servicio: TipoServicio = "separador") {
		// Verificar si hay un archivo abierto
		const archivo = this.app.workspace.getActiveFile();

		if (!archivo) {
			new Notice("No hay archivo activo para procesar");
			return;
		}

		// Obtener el contenido del archivo
		const contenido = await this.copiarContenidoArchivo(archivo);

		if (!contenido) {
			new Notice("No hay contenido en el archivo");
			return;
		}

		// Enviar petición POST al servidor local
		new Notice(`Procesando contenido con servicio: ${servicio}`);
		const respuesta = await this.peticion(contenido, servicio);

		if (!respuesta) {
			new Notice("No se pudo obtener la respuesta del servidor");
			return;
		}

		// Modificar el contenido del archivo
		const { texto_procesado } = respuesta;
		await this.app.vault.modify(archivo, texto_procesado);
	}

	/**
	 * Método para copiar el contenido de un archivo
	 *
	 * @param {TFile} archivoActivo - Archivo del que se copiará el contenido
	 * @returns {Promise<string | null>} Contenido del archivo o null si no se pudo leer
	 */
	private async copiarContenidoArchivo(
		archivoActivo: TFile
	): Promise<string | null> {
		try {
			return await this.app.vault.read(archivoActivo);
		} catch (error) {
			return null;
		}
	}

	/**
	 * Método para enviar una petición POST al servidor local con un servicio específico
	 *
	 * @param {string} contenido - Contenido a enviar al servidor
	 * @param {TipoServicio} servicio - Tipo de servicio a utilizar
	 * @returns {Promise<Data | null>} Respuesta del servidor o null si no se pudo obtener
	 */
	private async peticion(
		contenido: string,
		servicio: TipoServicio
	): Promise<Data | null> {
		try {
			const datos = await ofetch<Data>(
				`http://127.0.0.1:5000/${servicio}`,
				{
					method: "POST",
					body: JSON.stringify({
						text: contenido,
					}),
				}
			);

			return datos;
		} catch (error) {
			new Notice(`Error en la petición: ${error}`);
			return null;
		}
	}
}
