/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const sequencer = require('image-sequencer')();

exports.helloWorld = (req, res) => {

    const img = req.query.url,
        sequence = req.query.sequence,
        redirect = req.query.redirect === 'true';
    const ts0 = performance.now();

    sequencer.loadImages(img, () => {
        sequencer.importString(sequence);
        sequencer.run(out => {
            const t21 = performance.now();
            const html = ` <html>
							<img src = "${out}">
							</html>
                            `,
                response = redirect ? html : { data: out, runtime: t1 - t0 }
            res.status(200).send(response);
        });
    });
}
