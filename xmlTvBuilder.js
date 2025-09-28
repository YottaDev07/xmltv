/**
 * XMLTV Builder for Node.js
 * Converts channel and program data into valid XMLTV format
 */

class XmlTvBuilder {
  /**
   * Escape XML special characters
   */
  static xmlEscape(value) {
    if (typeof value !== "string") {
      value = String(value);
    }

    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Format date for XMLTV
   */
  static formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Get timezone offset
    const offset = date.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset <= 0 ? "+" : "-";
    const timezone = `${offsetSign}${String(offsetHours).padStart(
      2,
      "0"
    )}${String(offsetMinutes).padStart(2, "0")}`;

    return `${year}${month}${day}${hours}${minutes}${seconds} ${timezone}`;
  }

  /**
   * Build XMLTV document
   */
  static build(channels, listings) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<!DOCTYPE tv SYSTEM "xmltv.dtd">\n';
    xml +=
      '<tv source-info-url="https://schedulesdirect.org" source-info-name="SD-LR-OTA" generator-info-name="LR-EPG-NodeJS-1.0">\n';

    // Add channels
    for (const channel of channels) {
      xml += `  <channel id="${this.xmlEscape(channel.id)}">\n`;
      xml += `    <display-name>${this.xmlEscape(
        channel.name
      )}</display-name>\n`;
      if (channel.icon) {
        xml += `    <icon src="${this.xmlEscape(channel.icon)}"/>\n`;
      }
      xml += "  </channel>\n";
    }

    // Add programs
    for (const listing of listings) {
      xml += `  <programme start="${this.formatDate(
        listing.start
      )}" stop="${this.formatDate(listing.stop)}" channel="${this.xmlEscape(
        listing.channel
      )}">\n`;
      xml += `    <title lang="en">${this.xmlEscape(listing.title)}</title>\n`;

      if (listing.sub) {
        xml += `    <sub-title lang="en">${this.xmlEscape(
          listing.sub
        )}</sub-title>\n`;
      }

      if (listing.desc) {
        xml += `    <desc lang="en">${this.xmlEscape(listing.desc)}</desc>\n`;
      }

      if (listing.icon) {
        xml += `    <icon src="${this.xmlEscape(listing.icon)}"/>\n`;
      }

      if (listing.ddprogid) {
        xml += `    <episode-num system="dd_progid">${this.xmlEscape(
          listing.ddprogid
        )}</episode-num>\n`;
      }

      xml += "  </programme>\n";
    }

    xml += "</tv>\n";
    return xml;
  }
}

module.exports = XmlTvBuilder;
