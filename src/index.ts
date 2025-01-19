import { Plugin, Notice } from "obsidian";
import LLM from "./LLM";
import NewPages from "./newPages";

import type { App, PluginManifest } from "obsidian";

/**
 * Unificador es el complemento principal de Obsidian que gestiona
 * múltiples características de procesamiento de texto.
 *
 * @class Unificador
 * @extends Plugin
 */
export default class Unificador extends Plugin {
	// Instancia del servicio de procesamiento de texto
	private llm: LLM;
	private newPages: NewPages;

	/**
	 * Constructor del complemento que inicializa las dependencias
	 *
	 * @param {App} app - Instancia principal de la aplicación Obsidian
	 * @param {PluginManifest} manifest - Metadatos del complemento
	 */
	constructor(app: App, manifest: PluginManifest) {
		// Llama al constructor padre de Plugin
		super(app, manifest);

		// Crea una instancia del LLM con la aplicación actual
		this.llm = new LLM(app);
		this.newPages = new NewPages(app);
	}

	/**
	 * Método principal de carga del complemento.
	 * Se ejecuta cuando el complemento se activa en Obsidian.
	 */
	async onload() {
		// Muestra una notificación de bienvenida al cargar el complemento
		new Notice("¡Complemento Unificador cargado!");

		// Comando personalizado para separar contenido
		this.addCommand({
			// Identificador único para el comando
			id: "separar-contenido",

			// Nombre descriptivo que aparecerá en la interfaz de Obsidian
			name: "Separar contenido",

			// Función que se ejecuta al invocar el comando
			callback: () => this.llm.procesarContenido("separador"),

			// Configurar atajo de teclado (Ctrl+Q)
			hotkeys: [
				{
					modifiers: ["Ctrl", "Shift"],
					key: "q",
				},
			],
		});

		// Comando personalizado para dividir varios archivos
		this.addCommand({
			// Identificador único para el comando
			id: "dividir-archivos",

			// Nombre descriptivo que aparecerá en la interfaz de Obsidian
			name: "Dividir archivos",

			// Función que se ejecuta al invocar el comando
			callback: () => this.newPages.newPages(),

			// Configurar atajo de teclado (Ctrl+Shift+A)
			hotkeys: [
				{
					modifiers: ["Ctrl", "Shift"],
					key: "A",
				},
			],
		});

		// Comando personalizado para corregir ortografía
		this.addCommand({
			// Identificador único para el comando
			id: "corregir-ortografia",

			// Nombre descriptivo que aparecerá en la interfaz de Obsidian
			name: "Corregir ortografía",

			// Función que se ejecuta al invocar el comando
			callback: () => this.llm.procesarContenido("corrector"),

			// Configurar atajo de teclado (Ctrl+Shift+C)
			hotkeys: [
				{
					modifiers: ["Ctrl", "Shift"],
					key: "O",
				},
			],
		});
	}

	/**
	 * Método de descarga del complemento.
	 * Se ejecuta cuando el complemento se desactiva en Obsidian.
	 */
	onunload() {
		// Muestra una notificación de despedida al descargar el complemento
		new Notice("¡Complemento Unificador descargado!");
	}
}
