export function isEditedInfrastructureNewer(createdOn: string, changedOn: string): boolean {
    return new Date(changedOn).getTime() > new Date(createdOn).getTime();
}
