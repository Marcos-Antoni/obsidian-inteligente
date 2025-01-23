import { Pagina } from "./types";

export class TextoService {
	private separador = ["{{{", "}}}"];

	/**
	 * Procesa el texto dividido por {{{, extrayendo solo la parte inicial
	 *
	 * @param {string} texto - Texto original a procesar
	 * @returns {string[]} Array de textos procesados
	 */
	filtrarTexto(texto: string): string[] {
		return texto
			.split(this.separador[0])
			.map((parte) => parte.split(this.separador[1])[0])
			.filter((parte) => parte.trim() !== "");
	}

	/**
	 * Reemplaza el contenido de las paginas en el texto original
	 *
	 * @param {string} texto - Texto original a procesar
	 * @param {Pagina[]} paginasCreadas - Array de paginas creadas
	 * @returns {string} Texto con las paginas reemplazadas
	 */
	remplazarTexto(texto: string, paginasCreadas: Pagina[]): string {
		let textoEditable = texto;

		paginasCreadas.forEach((pagina) => {
			textoEditable = textoEditable.replace(
				`${this.separador[0]}${pagina.contenido}${this.separador[1]}`,
				`[[${pagina.nombre}]]`
			);
		});

		return textoEditable;
	}
}
