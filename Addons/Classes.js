const log = require('./Logger');

/**
 * Class representing an error handler for Discord interactions.
 */
class InteractionError {
    /**
     * Create an error handler instance.
     * @param {Discord.Interaction} interaction - The Discord interaction object.
     * @param {string} fileName - The name of the file where the error occurred.
     */
    constructor(interaction, fileName) {
        this.interaction = interaction;
        this.fileName = fileName;
    }

    /**
     * Report the issue to the user and log it.
     * @async
     * @param {Error} error - The error object.
     * @returns {Promise<void>}
     */
    async issue(error) {
        try {
            switch (error.name) {
                // Handle Axios Errors.
                case 'AxiosError': return AxiosErrorHandler(error, this.interaction);

                // Default error handling.
                default: {
                    // Log the error to the console.
                    log.bug(`[${this.fileName}] Interaction error:`, error);
                    return await sendInteractionResponse(this.interaction, '🥶 Something went wrong, try again later.');
                }
            }

        } catch (responseError) {
            log.bug(`[${this.fileName}] InteractionError Class Error:`, responseError);
        }
    }
}


async function AxiosErrorHandler(error, interaction) {

    try {

        // Destructure assignment
        const { status, statusText } = error.response;

        // Make a string with the error message response to the user if error occurs in Axios Error.
        let errorResponseString = '';

        // Check if error object has my custom error data message.
        if (error.response.data?.message) {
            // Fill the string with the custom error data message.
            errorResponseString = `🥶 Something went wrong with API\n> [${status} ${statusText}]\n> \`${error.response.data?.message}\``;
        } else { // Response that should be private.
            errorResponseString = `🥶 Something went wrong with API\n> \`${error.message}\``;
        }

        // Return a function to send reply using the string response made above.
        return await sendInteractionResponse(interaction, errorResponseString);
    } catch (error2) {
        new InteractionError(this.interaction, this.fileName).issue(error2);
    }
}


/**
 * Send an interaction response with an error message.
 * @async
 * @param {Discord.Interaction} interaction - The Discord interaction object.
 * @param {string} errorMessage - The error message to display.
 * @returns {Promise<void>}
 */
async function sendInteractionResponse(interaction, errorMessage) {

    try {
        // Check if interaction is already replied and respond accordingly.
        if (interaction.replied) return await interaction.editReply({ content: errorMessage ? errorMessage : 'Error message is not provided.' });

        // Otherwise just send the interaction reply.
        await interaction.reply({ content: errorMessage ? errorMessage : 'Error message is not provided.', ephemeral: true, });
    } catch (error) {
        new InteractionError(this.interaction, this.fileName).issue(error);
    }
}

module.exports = {
    InteractionError
};